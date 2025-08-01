const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // hashed
  role: { type: String, enum: ['donor', 'recipient', 'admin'], required: true },
  bloodType: String, // for donors/recipients
  location: String,
  dateOfBirth: Date, // for age calculation
  lastDonationDate: Date // for donors
});

module.exports = mongoose.model('User', userSchema); 