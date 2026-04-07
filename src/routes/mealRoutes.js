const express = require('express');
const router = express.Router();

const {
    saveMeal,
    getMeals,
    getMealById,
    deleteMeal,
    getLatestMeals,
    getMealsByDate,
    getMealsByRange,
    getLatestLimit
} = require('../controllers/mealController');

const authMiddleware = require('../middleware/authMiddleware');


// SAVE
router.post('/meal', authMiddleware, saveMeal);

// GET ALL USER MEALS
router.get('/meal/:user_id', authMiddleware, getMeals);

// GET SINGLE (click caution)
router.get('/meal/detail/:id', authMiddleware, getMealById);

// DELETE
router.delete('/meal/:id', authMiddleware, deleteMeal);

// LATEST
router.get('/meal/latest/:user_id', authMiddleware, getLatestMeals);

// DATE
router.get('/meal/date/:user_id', authMiddleware, getMealsByDate);

// RANGE
router.get('/meal/range/:user_id', authMiddleware, getMealsByRange);

// LIMIT
router.get('/meal/latest-limit/:user_id', authMiddleware, getLatestLimit);

module.exports = router;