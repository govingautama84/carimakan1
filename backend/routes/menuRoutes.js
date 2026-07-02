const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getMyMenus, getMenuByRestaurantId, createMenu, updateMenu,
  deleteMenu, toggleAvailability, importFromMealDB, getMealDBCategories
} = require('../controllers/menuController');

// Public
router.get('/restaurant/:restaurantId', getMenuByRestaurantId);
router.get('/mealdb/categories', getMealDBCategories);

// Restaurant owner
router.get('/my', authMiddleware, authorizeRoles('RESTAURANT'), getMyMenus);
router.post('/', authMiddleware, authorizeRoles('RESTAURANT'), upload.single('image'), createMenu);
router.put('/:id', authMiddleware, authorizeRoles('RESTAURANT'), upload.single('image'), updateMenu);
router.delete('/:id', authMiddleware, authorizeRoles('RESTAURANT'), deleteMenu);
router.patch('/:id/toggle', authMiddleware, authorizeRoles('RESTAURANT'), toggleAvailability);
router.post('/import-mealdb', authMiddleware, authorizeRoles('RESTAURANT'), importFromMealDB);

module.exports = router;
