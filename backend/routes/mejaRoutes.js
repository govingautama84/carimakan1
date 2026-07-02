const express = require('express');
const router = express.Router();
const { getAllMeja, getMejaById, getMejaByNomor, createMeja, updateMeja, deleteMeja, generateQRCode } = require('../controllers/mejaController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/', getAllMeja);
router.get('/nomor/:nomor', getMejaByNomor);
router.get('/:id', getMejaById);
router.post('/', authMiddleware, adminMiddleware, createMeja);
router.put('/:id', authMiddleware, adminMiddleware, updateMeja);
router.delete('/:id', authMiddleware, adminMiddleware, deleteMeja);
router.post('/:id/generate-qr', authMiddleware, adminMiddleware, generateQRCode);

module.exports = router;
