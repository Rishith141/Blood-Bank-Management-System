const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const {
  getProfile,
  updateProfile,
  createRequest,
  getRequests,
  getRequest,
  cancelRequest
} = require('../controllers/recipientController');

// All routes require authentication and recipient role
router.use(auth);
router.use(role(['recipient']));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/requests', createRequest);
router.get('/requests', getRequests);
router.get('/requests/:id', getRequest);
router.put('/requests/:id/cancel', cancelRequest);

module.exports = router; 