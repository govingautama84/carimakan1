const express = require('express');
const router = express.Router();
const {
  getAllPesanan,
  getPesananByNomor,
  getPesananById,
  createPesanan,
  updateStatusPesanan,
  deletePesanan,
  getDashboard,
  getLaporan
} = require('../controllers/pesananController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Public routes
router.post('/', createPesanan);
router.get('/track/:nomor', getPesananByNomor);

// Admin routes
router.get('/dashboard', authMiddleware, adminMiddleware, getDashboard);
router.get('/laporan', authMiddleware, adminMiddleware, getLaporan);
router.get('/', authMiddleware, adminMiddleware, getAllPesanan);
router.get('/:id', authMiddleware, adminMiddleware, getPesananById);
router.put('/:id', authMiddleware, adminMiddleware, updateStatusPesanan);
router.delete('/:id', authMiddleware, adminMiddleware, deletePesanan);

module.exports = router;
