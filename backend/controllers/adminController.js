const User = require('../models/User');
const Donation = require('../models/Donation');
const Request = require('../models/Request');
const Inventory = require('../models/Inventory');
const emailService = require('../services/emailService');

// Get admin dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalRecipients = await User.countDocuments({ role: 'recipient' });
    const totalDonations = await Donation.countDocuments({ status: 'completed' });
    const pendingRequests = await Request.countDocuments({ status: 'pending' });
    
    // Get blood inventory summary
    const inventory = await Inventory.find();
    const totalBloodUnits = inventory.reduce((sum, item) => sum + item.units, 0);
    
    // Get recent donations
    const recentDonations = await Donation.find({ status: 'completed' })
      .populate('donor', 'name bloodType')
      .sort({ date: -1 })
      .limit(5);
    
    // Get recent requests
    const recentRequests = await Request.find()
      .populate('recipient', 'name bloodType')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      totalDonors,
      totalRecipients,
      totalDonations,
      pendingRequests,
      totalBloodUnits
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user by ID
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { name, email, bloodType, location } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, bloodType, location },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Also delete related donations/requests
    await Donation.deleteMany({ donor: req.params.id });
    await Request.deleteMany({ recipient: req.params.id });
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all donations
exports.getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('donor', 'name bloodType')
      .sort({ date: -1 });
    
    // Format for dashboard display
    const formattedDonations = donations.map(donation => ({
      donorName: donation.donor?.name || 'Unknown',
      bloodType: donation.bloodType,
      date: donation.date,
      units: donation.units,
      status: donation.status
    }));
    
    res.json(formattedDonations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get recent donations for dashboard
exports.getRecentDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ status: 'completed' })
      .populate('donor', 'name bloodType')
      .sort({ date: -1 })
      .limit(5);
    
    const formattedDonations = donations.map(donation => ({
      donorName: donation.donor.name,
      bloodType: donation.bloodType,
      date: donation.date,
      units: donation.units
    }));
    
    res.json(formattedDonations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update donation status
exports.updateDonationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('donor', 'name bloodType');
    
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }
    
    // If donation is completed, update inventory
    if (status === 'completed') {
      await updateInventory(donation.bloodType, donation.units);
    }
    
    res.json(donation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('recipient', 'name bloodType')
      .sort({ createdAt: -1 });
    
    // Format for dashboard display
    const formattedRequests = requests.map(request => ({
      _id: request._id,
      recipientName: request.recipient?.name || 'Unknown',
      bloodType: request.bloodType,
      units: request.units,
      status: request.status,
      createdAt: request.createdAt
    }));
    
    res.json(formattedRequests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update request status
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('recipient', 'name email');
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // If request is fulfilled, reduce inventory
    if (status === 'fulfilled') {
      await updateInventory(request.bloodType, -request.units);
    }
    
    // Send email notification if request is approved
    if (status === 'approved' && request.recipient) {
      try {
        await emailService.sendRequestApproved(
          request.recipient.email,
          request.recipient.name,
          request.bloodType,
          request.units
        );
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }
    }
    
    res.json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Helper function to update inventory
async function updateInventory(bloodType, units) {
  try {
    let inventory = await Inventory.findOne({ bloodType });
    
    if (!inventory) {
      inventory = new Inventory({ bloodType, units: 0 });
    }
    
    inventory.units += units;
    if (inventory.units < 0) inventory.units = 0;
    
    inventory.updatedAt = new Date();
    await inventory.save();
  } catch (err) {
    console.error('Error updating inventory:', err);
  }
}

// Reporting Functions
exports.getDonationReports = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    const donations = await Donation.find({
      date: { $gte: startDate },
      status: 'completed'
    }).populate('donor', 'name bloodType');
    
    const report = {
      period,
      totalDonations: donations.length,
      totalUnits: donations.reduce((sum, d) => sum + d.units, 0),
      byBloodType: {},
      byDate: {}
    };
    
    donations.forEach(donation => {
      // Group by blood type
      if (!report.byBloodType[donation.bloodType]) {
        report.byBloodType[donation.bloodType] = { count: 0, units: 0 };
      }
      report.byBloodType[donation.bloodType].count++;
      report.byBloodType[donation.bloodType].units += donation.units;
      
      // Group by date
      const dateKey = donation.date.toISOString().split('T')[0];
      if (!report.byDate[dateKey]) {
        report.byDate[dateKey] = { count: 0, units: 0 };
      }
      report.byDate[dateKey].count++;
      report.byDate[dateKey].units += donation.units;
    });
    
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRequestReports = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    const requests = await Request.find({
      createdAt: { $gte: startDate }
    }).populate('recipient', 'name bloodType');
    
    const report = {
      period,
      totalRequests: requests.length,
      totalUnits: requests.reduce((sum, r) => sum + r.units, 0),
      byStatus: {},
      byBloodType: {},
      byUrgency: {}
    };
    
    requests.forEach(request => {
      // Group by status
      if (!report.byStatus[request.status]) {
        report.byStatus[request.status] = { count: 0, units: 0 };
      }
      report.byStatus[request.status].count++;
      report.byStatus[request.status].units += request.units;
      
      // Group by blood type
      if (!report.byBloodType[request.bloodType]) {
        report.byBloodType[request.bloodType] = { count: 0, units: 0 };
      }
      report.byBloodType[request.bloodType].count++;
      report.byBloodType[request.bloodType].units += request.units;
      
      // Group by urgency
      if (!report.byUrgency[request.urgency]) {
        report.byUrgency[request.urgency] = { count: 0, units: 0 };
      }
      report.byUrgency[request.urgency].count++;
      report.byUrgency[request.urgency].units += request.units;
    });
    
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInventoryReports = async (req, res) => {
  try {
    const inventory = await Inventory.find().sort({ bloodType: 1 });
    const lowStockThreshold = 10;
    
    const report = {
      totalBloodTypes: inventory.length,
      totalUnits: inventory.reduce((sum, item) => sum + item.units, 0),
      lowStockItems: inventory.filter(item => item.units <= lowStockThreshold),
      byBloodType: inventory.map(item => ({
        bloodType: item.bloodType,
        units: item.units,
        status: item.units <= lowStockThreshold ? 'low' : 'normal',
        lastUpdated: item.updatedAt
      }))
    };
    
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getActiveDonorsReport = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get donors with most donations
    const activeDonors = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: {
        _id: '$donor',
        totalDonations: { $sum: 1 },
        totalUnits: { $sum: '$units' },
        lastDonation: { $max: '$date' }
      }},
      { $sort: { totalDonations: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    // Populate donor details
    const donorsWithDetails = await User.populate(activeDonors, {
      path: '_id',
      select: 'name email bloodType location'
    });
    
    const report = {
      topDonors: donorsWithDetails.map(donor => ({
        donor: donor._id,
        totalDonations: donor.totalDonations,
        totalUnits: donor.totalUnits,
        lastDonation: donor.lastDonation
      }))
    };
    
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Notification Functions
exports.sendNotification = async (req, res) => {
  try {
    const { type, recipients, message, bloodType } = req.body;
    
    // For now, we'll just log the notification
    // In a real system, you'd integrate with email/SMS services
    console.log('Notification sent:', {
      type,
      recipients,
      message,
      bloodType,
      timestamp: new Date()
    });
    
    res.json({ 
      message: 'Notification sent successfully',
      type,
      recipients: recipients.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    // For now, return a mock notification list
    // In a real system, you'd store notifications in a database
    const notifications = [
      {
        id: 1,
        type: 'low_stock',
        message: 'Blood type A+ is running low (5 units remaining)',
        timestamp: new Date(),
        read: false
      },
      {
        id: 2,
        type: 'request_approved',
        message: 'Blood request for B+ has been approved',
        timestamp: new Date(Date.now() - 3600000),
        read: true
      }
    ];
    
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLowStockAlerts = async (req, res) => {
  try {
    const threshold = req.query.threshold || 10;
    const lowStock = await Inventory.find({ units: { $lte: threshold } });
    
    const alerts = lowStock.map(item => ({
      bloodType: item.bloodType,
      currentUnits: item.units,
      threshold,
      urgency: item.units <= 5 ? 'critical' : 'warning'
    }));
    
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 