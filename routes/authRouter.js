// External Module
const express = require("express");
const authRouter = express.Router();

// Local Module
const authController = require("../controllers/authController");

authRouter.get("/login", authController.getLogin);
authRouter.post("/login", authController.postLogin);
authRouter.post("/logout", authController.postLogout);
authRouter.get("/signup", authController.getSignup);
authRouter.post("/signup", authController.postSignup);

// OTP Auth Flow
authRouter.get("/forgot-password", authController.getForgotPassword);
authRouter.post("/forgot-password", authController.postForgotPassword);
authRouter.get("/verify-otp", authController.getVerifyOtp);
authRouter.post("/verify-otp", authController.postVerifyOtp);
authRouter.get("/reset-password", authController.getResetPassword);
authRouter.post("/reset-password", authController.postResetPassword);

module.exports = authRouter;