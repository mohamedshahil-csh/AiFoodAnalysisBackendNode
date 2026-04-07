const getDB = require('../config/db');
const Food = require('../models/Food');

// ADD FOOD
exports.addFood = async (req, res) => {
    const { name, calories, protein, fat, carbs } = req.body;
    const dbType = (process.env.DB_TYPE || 'mysql').trim();

    try {
        if (dbType === 'mongodb') {
            const newFood = new Food({ name, calories, protein, fat, carbs });
            await newFood.save();
            return res.status(201).json({ message: 'Food added successfully (MongoDB)' });
        } else {
            // MySQL Promise-based
            const query = `INSERT INTO foods (name, calories, protein, fat, carbs) VALUES (?, ?, ?, ?, ?)`;
            await getDB().promise().query(query, [name, calories, protein, fat, carbs]);
            return res.status(201).json({ message: 'Food added successfully (MySQL)' });
        }
    } catch (error) {
        console.error("Add Food Error:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET ALL FOODS
exports.getAllFoods = async (req, res) => {
    const dbType = (process.env.DB_TYPE || 'mysql').trim();

    try {
        if (dbType === 'mongodb') {
            const foods = await Food.find();
            return res.json(foods);
        } else {
            // MySQL Promise-based
            const query = `SELECT * FROM foods`;
            const [results] = await getDB().promise().query(query);
            return res.json(results);
        }
    } catch (error) {
        console.error("Get All Foods Error:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};