const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { createReview, getRestaurantReviews, getMyReviews } = require('../controllers/reviewController');

router.post('/', authMiddleware, authorizeRoles('CUSTOMER'), upload.single('image'), createReview);
router.get('/restaurant/:restaurantId', getRestaurantReviews); // public
router.get('/my', authMiddleware, authorizeRoles('CUSTOMER'), getMyReviews);

module.exports = router;
