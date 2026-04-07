const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Laragon default
    database: 'FoodAnalysis' // 👈 your DB name
});

db.connect((err) => {
    if (err) {
        console.error('DB connection error:', err);
        return;
    }
    console.log('MySQL Connected...');
});

module.exports = db;