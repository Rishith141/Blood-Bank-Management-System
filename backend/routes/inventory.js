const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const {
  getAllInventory,
  getInventoryByType,
  updateInventory,
  addUnits,
  removeUnits,
  searchInventory,
  getLowStockAlerts
} = require('../controllers/inventoryController');

// Public routes (no authentication required)
router.get('/', getAllInventory);
router.get('/search', searchInventory);
router.get('/low-stock', getLowStockAlerts);
router.get('/:bloodType', getInventoryByType);

// Protected routes (admin only)
router.use(auth);
router.use(role(['admin']));

router.post('/', updateInventory);
router.put('/:bloodType', updateInventory);
router.post('/add', addUnits);
router.post('/remove', removeUnits);

module.exports = router; 