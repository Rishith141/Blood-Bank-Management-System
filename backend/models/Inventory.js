const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  bloodType: { type: String, required: true, unique: true },
  units: { type: Number, required: true, min: 0 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inventory', inventorySchema); 