const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const {
  createReservasi, getMyReservations, getReservationById,
  getRestaurantReservations, updateReservationStatus, getAllReservationsAdmin
} = require('../controllers/reservasiController');

// Customer
router.post('/', authMiddleware, authorizeRoles('CUSTOMER'), createReservasi);
router.get('/my', authMiddleware, authorizeRoles('CUSTOMER'), getMyReservations);
router.get('/my/:id', authMiddleware, authorizeRoles('CUSTOMER'), getReservationById);

// Restoran
router.get('/restaurant', authMiddleware, authorizeRoles('RESTAURANT'), getRestaurantReservations);
router.patch('/:id/status', authMiddleware, authorizeRoles('RESTAURANT'), updateReservationStatus);

// Admin
router.get('/admin/all', authMiddleware, authorizeRoles('ADMIN'), getAllReservationsAdmin);

module.exports = router;
