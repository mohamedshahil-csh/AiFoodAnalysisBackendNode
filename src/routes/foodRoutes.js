const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const authMiddleware = require('../middleware/authMiddleware');

// ✅ Protected routes (JWT required)
router.post('/add', authMiddleware, foodController.addFood);
router.get('/', authMiddleware, foodController.getFoods);

module.exports = router;