const express = require('express');
const router = express.Router();
const { getAllKategori, getKategoriById, createKategori, updateKategori, deleteKategori } = require('../controllers/kategoriController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/', getAllKategori);
router.get('/:id', getKategoriById);
router.post('/', authMiddleware, adminMiddleware, createKategori);
router.put('/:id', authMiddleware, adminMiddleware, updateKategori);
router.delete('/:id', authMiddleware, adminMiddleware, deleteKategori);

module.exports = router;
