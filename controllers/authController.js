const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { sendMail, getWelcomeEmailTemplate, getOtpEmailTemplate, getResetSuccessEmailTemplate } = require("../utils/sendMail");
const { generateOTP } = require("../utils/otpGenerator");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    currentPage: "login",
    isLoggedIn: false,
    errors: [],
    oldInput: { email: "" },
    user: {},
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Signup",
    currentPage: "signup",
    isLoggedIn: false,
    errors: [],
    oldInput: { firstName: "", lastName: "", email: "", userType: "" },
    user: {},
  });
};

exports.postSignup = [
  check("firstName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First Name should be atleast 2 characters long")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("First Name should contain only alphabets"),

  check("lastName")
    .matches(/^[A-Za-z\s]*$/)
    .withMessage("Last Name should contain only alphabets"),

  check("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  // ✅ SIMPLIFIED PASSWORD RULE
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password should be at least 6 characters long")
    .trim(),

  check("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  check("userType")
    .notEmpty()
    .withMessage("Please select a user type")
    .isIn(["guest", "host"])
    .withMessage("Invalid user type"),

  check("terms")
    .notEmpty()
    .withMessage("Please accept the terms and conditions")
    .custom((value) => {
      if (value !== "on") {
        throw new Error("Please accept the terms and conditions");
      }
      return true;
    }),

  (req, res, next) => {
    const { firstName, lastName, email, password, userType } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signup", {
        pageTitle: "Signup",
        currentPage: "signup",
        isLoggedIn: false,
        errors: errors.array().map(err => err.msg),
        oldInput: { firstName, lastName, email, password, userType },
        user: {},
      });
    }

    bcrypt.hash(password, 12)
      .then(hashedPassword => {
        const user = new User({
          firstName,
          lastName,
          email,
          password: hashedPassword,
          userType
        });
        return user.save();
      })
      .then(savedUser => {
        // Send Welcome email asynchronously
        sendMail(savedUser.email, "Welcome to homysh 🎉", getWelcomeEmailTemplate(savedUser.firstName)).catch(console.error);
        res.redirect("/login");
      })
      .catch(err => {
        let errorMessage = "An unexpected error occurred. Please try again.";
        if (err.code === 11000) {
          errorMessage = "This email is already registered. Please log in or use the Forgot Password link.";
        } else if (err.message) {
          errorMessage = err.message;
        }

        return res.status(422).render("auth/signup", {
          pageTitle: "Signup",
          currentPage: "signup",
          isLoggedIn: false,
          errors: [errorMessage],
          oldInput: { firstName, lastName, email, userType },
          user: {},
        });
      });
  }
];


exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      currentPage: "login",
      isLoggedIn: false,
      errors: ["User does not exist"],
      oldInput: { email },
      user: {},
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      currentPage: "login",
      isLoggedIn: false,
      errors: ["Invalid Password"],
      oldInput: { email },
      user: {},
    });
  }

  req.session.isLoggedIn = true;
  req.session.user = user;
  await req.session.save();

  res.redirect("/");
}

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/login");
  })
}

// ==========================================
// OTP & FORGOT PASSWORD FLOW
// ==========================================

exports.getForgotPassword = (req, res, next) => {
  res.render("auth/forgot-password", {
    pageTitle: "Forgot Password",
    currentPage: "forgot-password",
    isLoggedIn: false,
    error: req.flash('error')[0],
    success: req.flash('success')[0]
  });
};

exports.postForgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error', 'No account with that email found.');
      return res.redirect("/forgot-password");
    }

    // Rate limiting: 1 request per 30 seconds
    if (user.otpLastRequested && (Date.now() - user.otpLastRequested) < 30000) {
      req.flash('error', 'Please wait 30 seconds before requesting another OTP.');
      return res.redirect("/forgot-password");
    }

    // Generate and hash OTP
    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 12);

    // Save to user with 5-minute expiry
    user.otp = hashedOtp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 mins
    user.otpAttempts = 0;
    user.otpLastRequested = Date.now();
    await user.save();

    // Send Mail
    await sendMail(email, "Password Reset - homysh", getOtpEmailTemplate(otp));

    req.flash('success', 'OTP sent to your email.');
    res.redirect("/verify-otp?email=" + encodeURIComponent(email));
  } catch (error) {
    console.error("Forgot password error:", error);
    next(error);
  }
};

exports.getVerifyOtp = (req, res, next) => {
  const email = req.query.email || '';
  res.render("auth/verify-otp", {
    pageTitle: "Verify OTP",
    currentPage: "verify-otp",
    isLoggedIn: false,
    email: email,
    error: req.flash('error')[0],
    success: req.flash('success')[0]
  });
};

exports.postVerifyOtp = async (req, res, next) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.otp) {
      req.flash('error', 'Invalid request or OTP expired.');
      return res.redirect("/forgot-password");
    }

    // Check expiry
    if (Date.now() > user.otpExpiry) {
      user.otp = undefined;
      user.otpExpiry = undefined;
      user.otpAttempts = 0;
      await user.save();
      req.flash('error', 'OTP has expired. Please request a new one.');
      return res.redirect("/forgot-password");
    }

    // Compare OTP
    const isMatch = await bcrypt.compare(otp.toString(), user.otp);
    if (!isMatch) {
      user.otpAttempts += 1;
      await user.save();
      req.flash('error', 'Invalid OTP.');
      return res.redirect("/verify-otp?email=" + encodeURIComponent(email));
    }

    // OTP Correct - Allow Reset
    req.session.resetEmail = email; // Store in session so they can reset
    await req.session.save();
    
    res.redirect("/reset-password");
  } catch (error) {
    console.error("Verify OTP error:", error);
    next(error);
  }
};

exports.getResetPassword = (req, res, next) => {
  if (!req.session.resetEmail) {
    req.flash('error', 'Please verify your OTP first.');
    return res.redirect("/forgot-password");
  }

  res.render("auth/reset-password", {
    pageTitle: "Reset Password",
    currentPage: "reset-password",
    isLoggedIn: false,
    error: req.flash('error')[0]
  });
};

exports.postResetPassword = async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  const email = req.session.resetEmail;

  if (!email) {
    req.flash('error', 'Invalid session. Please start over.');
    return res.redirect("/forgot-password");
  }

  if (password.length < 6) {
    req.flash('error', 'Password must be at least 6 characters.');
    return res.redirect("/reset-password");
  }

  if (password !== confirmPassword) {
    req.flash('error', 'Passwords do not match.');
    return res.redirect("/reset-password");
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect("/forgot-password");
    }

    // Update password
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    
    // Clear OTP fields
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpAttempts = 0;
    user.otpLastRequested = undefined;
    await user.save();

    // Clear session flag
    req.session.resetEmail = null;
    await req.session.save();

    // Send Success Email
    await sendMail(user.email, "Password Reset Successful", getResetSuccessEmailTemplate());

    req.flash('success', 'Password successfully reset. You can now login.');
    res.redirect("/login");
  } catch (error) {
    console.error("Reset password error:", error);
    next(error);
  }
};