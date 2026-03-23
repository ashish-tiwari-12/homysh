const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required']
  },
  lastName: String,
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  userType: {
    type: String,
    enum: ['guest', 'host'],
    default: 'guest'
  },
  favourites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Home'
  }],
  // OTP Fields for Forgot Password
  otp: { type: String }, // Hashed OTP
  otpExpiry: { type: Date },
  otpAttempts: { type: Number, default: 0 },
  otpLastRequested: { type: Date }
});

module.exports = mongoose.model('User', userSchema);