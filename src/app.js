const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const mealRoutes = require('./routes/mealRoutes');

const app = express();

// 📂 DATABASE INITIALIZATION
const initDB = async () => {
    const dbType = (process.env.DB_TYPE || 'mysql').trim();
    console.log(`Starting API in ${dbType} mode...`);

    try {
        if (dbType === 'mongodb') {
            const connectMongoDB = require('./config/mongodb');
            await connectMongoDB();
        } else {
            const connectMySQL = require('./config/db');
            connectMySQL(); // Initializes the lazy connection
        }
    } catch (err) {
        console.error('Database Initialization Error:', err.message);
    }
};

initDB();

app.use(cors());
app.use(express.json());

// 📝 LOG ALL REQUESTS
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use('/api/users', userRoutes);
app.use('/api', profileRoutes);
app.use('/api', mealRoutes);

app.get('/', (req, res) => {
    res.send(`Food Analysis API Running (${process.env.DB_TYPE || 'mysql'} mode)`);
});

// 🚨 GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR:", err.message);
    res.status(500).json({ 
        message: "Server error", 
        error: process.env.NODE_ENV === 'production' ? null : err.message 
    });
});

module.exports = app;