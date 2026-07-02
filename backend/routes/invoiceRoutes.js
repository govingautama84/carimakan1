const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { generateInvoicePDF, getInvoiceByOrder } = require('../controllers/invoiceController');

router.get('/order/:orderId', authMiddleware, getInvoiceByOrder);
router.get('/order/:orderId/pdf', authMiddleware, generateInvoicePDF);

module.exports = router;
