const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const {
  getAllUsers, getUserById, updateUser, deleteUser,
  getAllRestaurantsAdmin, updateRestaurantStatus, deleteRestaurant,
  getDashboardStats, getSalesReport
} = require('../controllers/adminController');

// Dashboard
router.get('/dashboard', authMiddleware, authorizeRoles('ADMIN'), getDashboardStats);
router.get('/reports/sales', authMiddleware, authorizeRoles('ADMIN'), getSalesReport);

// User Management
router.get('/users', authMiddleware, authorizeRoles('ADMIN'), getAllUsers);
router.get('/users/:id', authMiddleware, authorizeRoles('ADMIN'), getUserById);
router.put('/users/:id', authMiddleware, authorizeRoles('ADMIN'), updateUser);
router.delete('/users/:id', authMiddleware, authorizeRoles('ADMIN'), deleteUser);

// Restaurant Management
router.get('/restaurants', authMiddleware, authorizeRoles('ADMIN'), getAllRestaurantsAdmin);
router.patch('/restaurants/:id/status', authMiddleware, authorizeRoles('ADMIN'), updateRestaurantStatus);
router.delete('/restaurants/:id', authMiddleware, authorizeRoles('ADMIN'), deleteRestaurant);

module.exports = router;
