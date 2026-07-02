const express = require('express');
const router = express.Router();
const { register, registerRestoran, login, getProfile, updateProfile, changePassword } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/register', register);
router.post('/register-restoran', registerRestoran);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;
