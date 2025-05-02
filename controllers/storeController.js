const Home = require("../models/home");
const User = require("../models/user");
const Booking = require("../models/booking");
const nodemailer = require('nodemailer');
require('dotenv').config();
const isauth = require("../middleawre/islogin");


exports.getIndex = (req, res, next) => {
  console.log("Session Value: ", req.session);
  Home.find().then((registeredHomes) => {
    res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "airbnb Home",
      currentPage: "index",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.getHomes = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("store/home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Homes List",
      currentPage: "Home",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.getBookings = (req, res, next) => {
  res.render("store/bookings", {
    pageTitle: "My Bookings",
    currentPage: "bookings",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};

exports.getFavouriteList = async (req, res, next) => {
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate('favourites');
  res.render("store/favourite-list", {
    favouriteHomes: user.favourites,
    pageTitle: "My Favourites",
    currentPage: "favourites",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};

exports.postAddToFavourite = async (req, res, next) => {
  const homeId = req.body.id;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (!user.favourites.includes(homeId)) {
    user.favourites.push(homeId);
    await user.save();
  }
  res.redirect("/favourites");
};

exports.postRemoveFromFavourite = async (req, res, next) => {
  const homeId = req.params.homeId;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (user.favourites.includes(homeId)) {
    user.favourites = user.favourites.filter(fav => fav != homeId);
    await user.save();
  }
  res.redirect("/favourites");
};

exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findById(homeId).then((home) => {
    if (!home) {
      console.log("Home not found");
      res.redirect("/homes");
    } else {
      res.render("store/home-detail", {
        home: home,
        pageTitle: "Home Detail",
        currentPage: "Home",
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
      });
    }
  });
};

exports.showBookingForm = async (req, res) => {
  const homeId = req.params.id;
  const home = await Home.findById(homeId);
  res.render("store/book", {

    pageTitle: "Book This Home",
    currentPage: "book",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
    home
  })
};
exports.handleBooking = async (req, res) => {
  const { checkIn, checkOut, guests } = req.body;
  const homeId = req.params.id;
  const userId = req.session.user._id;
  // const userId =req.user._id;

  const overlapping = await Booking.findOne({
    homeId,
    $or: [
      {
        checkIn: { $lt: new Date(checkOut) },
        checkOut: { $gt: new Date(checkIn) }
      }
    ]
  });

  if (overlapping) {
    return res.send("This home is already booked during the selected dates.");
  }

  const booking = new Booking({
    homeId,
    userId,
    checkIn,
    checkOut,
    guests,
  });

  await booking.save();

  sendConfirmationEmail(req.session.user.email, booking);
  console.log(req.session.user.email);
  // res.send("Booking successful! Confirmation email sent.");
  res.redirect("/");


};

async function sendConfirmationEmail(to, booking) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });


  const home = await Home.findById(booking.homeId);
  const user = await User.findById(booking.userId);

  const mailOptions = {
    from: "HOMESTAY" + process.env.EMAIL_USER,
    to,
    subject: '🏡 Booking Confirmation - Your Stay is Reserved!',
    html: `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
    <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <div style="background-color: #ef4444; color: white; padding: 20px;">
        <h2 style="margin: 0;">🎉 Booking Confirmed!</h2>
        <p style="margin: 0;">Thanks for choosing us, <strong>${user.firstName || 'Guest'}</strong>!</p>
      </div>
      <div style="padding: 20px;">
        <h3 style="color: #333;">🏠 ${home.houseName}</h3>
        <p><strong>📍 Location:</strong> ${home.location}</p>
        <p><strong>🛏 Guests:</strong> ${booking.guests} person(s)</p>
        <p><strong>📅 Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
        <p><strong>📅 Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>
        <hr style="margin: 20px 0;">
        <p>If you have any questions, feel free to reply to this email.</p>
        <p>We can't wait to host you!</p>
      </div>
      <div style="background-color: #f3f4f6; color: #555; text-align: center; padding: 10px; font-size: 14px;">
        <p style="margin: 0;">Airbnb Clone • Built with ❤️ by Ashish</p>
      </div>
    </div>
  </div>
`

  };

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) console.error('Email error:', err);
    else console.log('Email sent:', info.response);
  });
}

// exports.showBookingForm = async (req, res) => {
//   const homeId = req.params.id;
//   const home = await Home.findById(homeId);
//   res.render('bookingForm', { home });
// };