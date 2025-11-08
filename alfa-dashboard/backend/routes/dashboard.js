const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getDashboardStats, getOwnerDashboardStats } = require('../controllers/dashboardController');

router.route('/').get(protect, getDashboardStats);
router.route('/owner').get(protect, getOwnerDashboardStats);

module.exports = router;