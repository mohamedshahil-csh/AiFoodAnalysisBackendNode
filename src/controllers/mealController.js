const getDB = require('../config/db');
const Meal = require('../models/Meal');
const mongoose = require('mongoose');

// SAVE MEAL
exports.saveMeal = async (req, res) => {
    const userId = req.user.id; // FIXED
    const data = req.body;
    const dbType = (process.env.DB_TYPE || 'mysql').trim();

    const dishName = data.dishName;
    const calories = data.ingredients?.[0]?.calories || 0;
    const healthScore = data.overallHealthScore || 0;
    const verdict = data.clinicalSuitability?.verdict || "Safe";
    const reason = data.clinicalSuitability?.explanation || "";

    try {
        if (dbType === 'mongodb') {
            const newMeal = new Meal({
                user_id: userId,
                dish_name: dishName,
                calories,
                health_score: healthScore,
                verdict,
                caution_reason: reason,
                full_json: data
            });

            await newMeal.save();

            return res.json({ message: "saved (MongoDB)" });

        } else {

            const query = `INSERT INTO meal_history 
                (user_id,dish_name,calories,health_score,verdict,caution_reason,full_json)
                VALUES (?,?,?,?,?,?,?)`;

            await getDB().promise().query(query, [
                userId,
                dishName,
                calories,
                healthScore,
                verdict,
                reason,
                JSON.stringify(data)
            ]);

            return res.json({ message: "saved (MySQL)" });
        }

    } catch (error) {
        console.error("Save Meal Error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET ALL MEALS
exports.getMeals = async (req, res) => {
    const userId = req.user.id; const dbType = (process.env.DB_TYPE || 'mysql').trim();

    try {
        if (dbType === 'mongodb') {
            const results = await Meal.find({ user_id: userId }).sort({ createdAt: -1 });
            const mappedResults = results.map(m => ({
                id: m._id,
                dish_name: m.dish_name,
                calories: m.calories,
                verdict: m.verdict,
                health_score: m.health_score,
                created_at: m.createdAt
            }));
            return res.json(mappedResults);
        } else {
            // MySQL Promise-based
            const query = `SELECT 
                    id,
                    dish_name,
                    calories,
                    verdict,
                    health_score,
                    created_at
                FROM meal_history
                WHERE user_id = ?
                ORDER BY created_at DESC`;

            const [results] = await getDB().promise().query(query, [userId]);
            return res.json(results);
        }
    } catch (error) {
        console.error("Get Meals Error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET SINGLE MEAL
exports.getMealById = async (req, res) => {
    const id = req.params.id;
    const dbType = (process.env.DB_TYPE || 'mysql').trim();

    try {
        if (dbType === 'mongodb') {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid ID format" });
            }
            const meal = await Meal.findById(id);
            if (!meal) return res.status(404).json({ message: "Not found" });
            return res.json(meal);
        } else {
            // MySQL Promise-based
            const query = `SELECT * FROM meal_history WHERE id = ?`;
            const [results] = await getDB().promise().query(query, [id]);
            return res.json(results[0] || {});
        }
    } catch (error) {
        console.error("Get Meal By ID Error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// DELETE MEAL
exports.deleteMeal = async (req, res) => {
    const id = req.params.id;
    const dbType = (process.env.DB_TYPE || 'mysql').trim();

    try {
        if (dbType === 'mongodb') {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid ID format" });
            }
            await Meal.findByIdAndDelete(id);
            return res.json({ message: "Deleted successfully (MongoDB)" });
        } else {
            // MySQL Promise-based
            const query = `DELETE FROM meal_history WHERE id = ?`;
            await getDB().promise().query(query, [id]);
            return res.json({ message: "Deleted successfully (MySQL)" });
        }
    } catch (error) {
        console.error("Delete Meal Error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET LATEST
exports.getLatestMeals = async (req, res) => {
    const userId = req.user.id; const limit = parseInt(req.query.limit) || 5;
    const dbType = (process.env.DB_TYPE || 'mysql').trim();

    try {
        if (dbType === 'mongodb') {
            const results = await Meal.find({ user_id: userId }).sort({ createdAt: -1 }).limit(limit);
            return res.json(results);
        } else {
            // MySQL
            const query = `SELECT * FROM meal_history
                 WHERE user_id = ?
                 ORDER BY created_at DESC
                 LIMIT ?`;
            const [results] = await db.promise().query(query, [userId, limit]);
            return res.json(results);
        }
    } catch (error) {
        console.error("Get Latest Meals Error:", error);
        return res.status(500).json({ message: "Error", error: error.message });
    }
};

// DATE, RANGE, LIMIT functions updated similarly...
exports.getMealsByDate = async (req, res) => {
    const userId = req.user.id; const { date } = req.query;
    const dbType = (process.env.DB_TYPE || 'mysql').trim();

    try {
        if (dbType === 'mongodb') {
            const start = new Date(date);
            const end = new Date(date);
            end.setDate(end.getDate() + 1);
            const results = await Meal.find({
                user_id: userId,
                createdAt: { $gte: start, $lt: end }
            }).sort({ createdAt: -1 });
            return res.json(results);
        } else {
            const query = `SELECT * FROM meal_history
                 WHERE user_id = ?
                 AND DATE(created_at) = ?`;
            const [results] = await db.promise().query(query, [userId, date]);
            return res.json(results);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error" });
    }
};

exports.getMealsByRange = async (req, res) => {
    const userId = req.user.id; const { startDate, endDate } = req.query;
    const dbType = (process.env.DB_TYPE || 'mysql').trim();

    try {
        if (dbType === 'mongodb') {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1);
            const results = await Meal.find({
                user_id: userId,
                createdAt: { $gte: start, $lt: end }
            }).sort({ createdAt: -1 });
            return res.json(results);
        } else {
            const query = `SELECT * FROM meal_history
                 WHERE user_id = ?
                 AND DATE(created_at) BETWEEN ? AND ?`;
            const [results] = await db.promise().query(query, [userId, startDate, endDate]);
            return res.json(results);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error" });
    }
};

exports.getLatestLimit = async (req, res) => {
    const userId = req.user.id; const limit = parseInt(req.query.limit) || 5;
    const dbType = (process.env.DB_TYPE || 'mysql').trim();

    try {
        if (dbType === 'mongodb') {
            const results = await Meal.find({ user_id: userId }).sort({ createdAt: -1 }).limit(limit);
            return res.json(results);
        } else {
            const query = `SELECT * FROM meal_history
                 WHERE user_id = ?
                 ORDER BY created_at DESC
                 LIMIT ?`;
            const [results] = await db.promise().query(query, [userId, limit]);
            return res.json(results);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error" });
    }
};