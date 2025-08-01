const Inventory = require('../models/Inventory');

// Get all inventory
exports.getAllInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find().sort({ bloodType: 1 });
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get inventory by blood type
exports.getInventoryByType = async (req, res) => {
  try {
    const inventory = await Inventory.findOne({ bloodType: req.params.bloodType });
    if (!inventory) {
      return res.status(404).json({ error: 'Blood type not found in inventory' });
    }
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update inventory
exports.updateInventory = async (req, res) => {
  try {
    let bloodType, units;
    
    // Handle both POST and PUT requests
    if (req.method === 'PUT') {
      bloodType = req.params.bloodType;
      units = req.body.units;
    } else {
      bloodType = req.body.bloodType;
      units = req.body.units;
    }
    
    let inventory = await Inventory.findOne({ bloodType });
    
    if (!inventory) {
      inventory = new Inventory({ bloodType, units });
    } else {
      inventory.units = units;
      inventory.updatedAt = new Date();
    }
    
    await inventory.save();
    res.json(inventory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Add units to inventory
exports.addUnits = async (req, res) => {
  try {
    const { bloodType, units } = req.body;
    
    let inventory = await Inventory.findOne({ bloodType });
    
    if (!inventory) {
      inventory = new Inventory({ bloodType, units });
    } else {
      inventory.units += units;
      inventory.updatedAt = new Date();
    }
    
    await inventory.save();
    res.json(inventory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Remove units from inventory
exports.removeUnits = async (req, res) => {
  try {
    const { bloodType, units } = req.body;
    
    const inventory = await Inventory.findOne({ bloodType });
    
    if (!inventory) {
      return res.status(404).json({ error: 'Blood type not found in inventory' });
    }
    
    if (inventory.units < units) {
      return res.status(400).json({ error: 'Not enough units available' });
    }
    
    inventory.units -= units;
    inventory.updatedAt = new Date();
    await inventory.save();
    
    res.json(inventory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Search inventory
exports.searchInventory = async (req, res) => {
  try {
    const { bloodType } = req.query;
    
    let query = {};
    if (bloodType) {
      query.bloodType = bloodType;
    }
    
    const inventory = await Inventory.find(query).sort({ bloodType: 1 });
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get low stock alerts
exports.getLowStockAlerts = async (req, res) => {
  try {
    const threshold = req.query.threshold || 10; // Default threshold of 10 units
    const lowStock = await Inventory.find({ units: { $lte: threshold } });
    res.json(lowStock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 