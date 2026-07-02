const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getAllRestoran, getRestoranById, getMenuByRestoran,
  getMyRestaurant, updateMyRestaurant,
  getDashboardStatsRestaurant
} = require('../controllers/restoranController');

// Public routes
router.get('/', getAllRestoran);
router.get('/:id', getRestoranById);
router.get('/:id/menu', getMenuByRestoran);

// Restaurant owner routes
router.get('/my/profile', authMiddleware, authorizeRoles('RESTAURANT'), getMyRestaurant);
router.put('/my/profile', authMiddleware, authorizeRoles('RESTAURANT'), upload.single('logo'), updateMyRestaurant);
router.get('/my/dashboard', authMiddleware, authorizeRoles('RESTAURANT'), getDashboardStatsRestaurant);

module.exports = router;
