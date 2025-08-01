const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const {
  getProfile,
  updateProfile,
  checkEligibility,
  scheduleDonation,
  getDonationHistory
} = require('../controllers/donorController');

// All routes require authentication and donor role
router.use(auth);
router.use(role(['donor']));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/eligibility', checkEligibility);
router.post('/schedule', scheduleDonation);
router.get('/history', getDonationHistory);

module.exports = router; 