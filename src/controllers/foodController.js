const db = require('../config/db');

// Add Food
exports.addFood = (req, res) => {
    const { name, calories, protein, fat, carbs } = req.body;

    const query = `
    INSERT INTO foods (name, calories, protein, fat, carbs)
    VALUES (?, ?, ?, ?, ?)
  `;

    db.query(query, [name, calories, protein, fat, carbs], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error adding food' });

        res.json({ message: 'Food added successfully' });
    });
};

// Get Foods
exports.getFoods = (req, res) => {
    db.query('SELECT * FROM foods', (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching foods' });

        res.json(results);
    });
};