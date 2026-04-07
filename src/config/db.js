const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

let connection;

// 🚀 LAZY CONNECTION WRAPPER
const getDB = () => {
    if (connection) return connection;

    connection = mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'FoodAnalysis'
    });

    connection.connect((err) => {
        if (err) {
            console.error('MySQL Connection Error:', err.message);
        } else {
            console.log('MySQL Connected...');
        }
    });

    return connection;
};

// Export the connection directly but lazily? 
// No, the safest is to export a proxy or just the function.
// For compatibility with `db.promise().query()`, let's export the function and fix the imports.

module.exports = getDB;