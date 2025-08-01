const User = require('../models/User');
const Donation = require('../models/Donation');

// Get donor profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update donor profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, bloodType, location, dateOfBirth } = req.body;
    console.log('Profile update request body:', req.body); // Debug log
    console.log('dateOfBirth received:', dateOfBirth); // Debug log
    
    const user = await User.findByIdAndUpdate(req.user.id, { name, bloodType, location, dateOfBirth }, { new: true }).select('-password');
    console.log('Updated user:', user); // Debug log
    res.json(user);
  } catch (err) {
    console.error('Profile update error:', err); // Debug log
    res.status(400).json({ error: err.message });
  }
};

// Check donation eligibility
exports.checkEligibility = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    console.log('User data for eligibility check:', user); // Debug log
    console.log('User dateOfBirth:', user.dateOfBirth); // Debug log
    
    const lastDonation = await Donation.findOne({ donor: req.user.id, status: 'completed' }).sort({ date: -1 });
    
    const today = new Date();
    const threeMonthsAgo = new Date(today.getTime() - (90 * 24 * 60 * 60 * 1000));
    
    // Age validation
    let ageEligible = true;
    let ageReason = '';
    let currentAge = null;
    
    if (user.dateOfBirth) {
      const birthDate = new Date(user.dateOfBirth);
      const ageDiff = today - birthDate;
      currentAge = Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25));
      console.log('Calculated age:', currentAge); // Debug log
      
      if (currentAge < 18) {
        ageEligible = false;
        ageReason = `You must be at least 18 years old to donate blood. Current age: ${currentAge} years.`;
      } else if (currentAge > 65) {
        ageEligible = false;
        ageReason = `You must be 65 years or younger to donate blood. Current age: ${currentAge} years.`;
      }
    } else {
      ageEligible = false;
      ageReason = 'Date of birth is required to verify age eligibility.';
    }
    
    // Time-based eligibility (90-day rule)
    const timeEligible = !lastDonation || lastDonation.date < threeMonthsAgo;
    const nextEligibleDate = lastDonation ? new Date(lastDonation.date.getTime() + (90 * 24 * 60 * 60 * 1000)) : null;
    
    // Overall eligibility (both age and time must be satisfied)
    const isEligible = ageEligible && timeEligible;
    
    const eligibilityData = { 
      isEligible, 
      nextEligibleDate, 
      lastDonationDate: lastDonation?.date,
      ageEligible,
      timeEligible,
      currentAge,
      ageReason,
      timeReason: !timeEligible ? `You must wait 90 days between donations. Next eligible date: ${nextEligibleDate?.toLocaleDateString()}` : ''
    };
    
    console.log('Eligibility response:', eligibilityData); // Debug log
    res.json(eligibilityData);
  } catch (err) {
    console.error('Eligibility check error:', err); // Debug log
    res.status(500).json({ error: err.message });
  }
};

// Schedule donation
exports.scheduleDonation = async (req, res) => {
  try {
    const { date, location } = req.body;
    const user = await User.findById(req.user.id);
    
    const donation = new Donation({
      donor: req.user.id,
      date: new Date(date),
      location,
      bloodType: user.bloodType
    });
    
    await donation.save();
    res.status(201).json(donation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get donation history
exports.getDonationHistory = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user.id }).sort({ date: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 