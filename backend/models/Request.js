const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bloodType: { type: String, required: true },
  units: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'fulfilled'], default: 'pending' },
  location: { type: String, required: true },
  urgency: { type: String, enum: ['low', 'medium', 'high', 'emergency'], default: 'medium' },
  reason: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema); 