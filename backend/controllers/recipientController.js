const User = require('../models/User');
const Request = require('../models/Request');

// Get recipient profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update recipient profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, bloodType, location } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, bloodType, location }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Create blood request
exports.createRequest = async (req, res) => {
  try {
    const { bloodType, units, location, urgency, reason } = req.body;
    
    const request = new Request({
      recipient: req.user.id,
      bloodType,
      units,
      location,
      urgency,
      reason
    });
    
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get recipient's requests
exports.getRequests = async (req, res) => {
  try {
    const requests = await Request.find({ recipient: req.user.id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get specific request
exports.getRequest = async (req, res) => {
  try {
    const request = await Request.findOne({ _id: req.params.id, recipient: req.user.id });
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cancel request (only if pending)
exports.cancelRequest = async (req, res) => {
  try {
    const request = await Request.findOne({ _id: req.params.id, recipient: req.user.id });
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot cancel non-pending request' });
    }
    
    request.status = 'cancelled';
    request.updatedAt = new Date();
    await request.save();
    
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 