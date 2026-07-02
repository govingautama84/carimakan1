const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const { createOrUpdatePayment, verifyPayment, getPaymentByOrder, getAllPaymentsAdmin } = require('../controllers/paymentController');

router.post('/', authMiddleware, authorizeRoles('CUSTOMER'), createOrUpdatePayment);
router.get('/order/:orderId', authMiddleware, getPaymentByOrder);
router.patch('/:id/verify', authMiddleware, authorizeRoles('RESTAURANT', 'ADMIN'), verifyPayment);
router.get('/admin/all', authMiddleware, authorizeRoles('ADMIN'), getAllPaymentsAdmin);

module.exports = router;
