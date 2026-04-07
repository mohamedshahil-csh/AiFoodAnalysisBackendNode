const db = require('../config/db');
const Food = require('../models/Food');

// Add Food
exports.addFood = async (req, res) => {
    const { name, calories, protein, fat, carbs } = req.body;

    try {
        if (process.env.DB_TYPE === 'mongodb') {
            const newFood = new Food({ name, calories, protein, fat, carbs });
            await newFood.save();
            res.json({ message: 'Food added successfully (MongoDB)' });
        } else {
            // MySQL
            const query = `
                INSERT INTO foods (name, calories, protein, fat, carbs)
                VALUES (?, ?, ?, ?, ?)
            `;
            db.query(query, [name, calories, protein, fat, carbs], (err, result) => {
                if (err) return res.status(500).json({ message: 'Error adding food' });
                res.json({ message: 'Food added successfully (MySQL)' });
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Foods
exports.getFoods = async (req, res) => {
    try {
        if (process.env.DB_TYPE === 'mongodb') {
            const foods = await Food.find().sort({ createdAt: -1 });
            res.json(foods);
        } else {
            // MySQL
            db.query('SELECT * FROM foods', (err, results) => {
                if (err) return res.status(500).json({ message: 'Error fetching foods' });
                res.json(results);
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};