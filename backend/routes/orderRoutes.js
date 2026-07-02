const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const {
  createOrder, getMyOrders, getOrderById, getOrderByNumber,
  getRestaurantOrders, updateOrderStatus, getAllOrdersAdmin
} = require('../controllers/orderController');

// Customer
router.post('/', authMiddleware, authorizeRoles('CUSTOMER'), createOrder);
router.get('/my', authMiddleware, authorizeRoles('CUSTOMER'), getMyOrders);
router.get('/track/:orderNumber', getOrderByNumber); // public untuk tracking
router.get('/:id', authMiddleware, getOrderById);

// Restoran
router.get('/restaurant/orders', authMiddleware, authorizeRoles('RESTAURANT'), getRestaurantOrders);
router.patch('/:id/status', authMiddleware, authorizeRoles('RESTAURANT', 'ADMIN'), updateOrderStatus);

// Admin
router.get('/admin/all', authMiddleware, authorizeRoles('ADMIN'), getAllOrdersAdmin);

module.exports = router;
