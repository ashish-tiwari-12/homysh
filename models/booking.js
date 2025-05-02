// models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  homeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Home', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests:{type:Number,required:true},
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'confirmed' } // you can expand later: pending, cancelled etc.
});

module.exports = mongoose.model('Booking', bookingSchema);
