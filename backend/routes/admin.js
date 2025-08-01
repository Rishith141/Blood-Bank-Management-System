const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const {
  getDashboardStats,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getAllDonations,
  updateDonationStatus,
  getAllRequests,
  updateRequestStatus,
  getDonationReports,
  getRequestReports,
  getInventoryReports,
  getActiveDonorsReport,
  sendNotification,
  getNotifications,
  getLowStockAlerts
} = require('../controllers/adminController');

// All routes require authentication and admin role
router.use(auth);
router.use(role(['admin']));

// Dashboard
router.get('/dashboard', getDashboardStats);
router.get('/stats', getDashboardStats);
router.get('/recent-donations', getAllDonations);
router.get('/recent-requests', getAllRequests);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Donation management
router.get('/donations', getAllDonations);
router.put('/donations/:id/status', updateDonationStatus);

// Request management
router.get('/requests', getAllRequests);
router.put('/requests/:id/status', updateRequestStatus);

// Reporting routes
router.get('/reports/donations', getDonationReports);
router.get('/reports/requests', getRequestReports);
router.get('/reports/inventory', getInventoryReports);
router.get('/reports/active-donors', getActiveDonorsReport);

// Notification routes
router.post('/notifications/send', sendNotification);
router.get('/notifications', getNotifications);

// Low stock alerts
router.get('/alerts/low-stock', getLowStockAlerts);

module.exports = router; 