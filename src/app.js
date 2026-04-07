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
            const getDB = require('./config/db');
            getDB(); // Initializes the lazy connection
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

// 🏥 HEALTH CHECK / DIAGNOSTICS
app.get('/api/health', (req, res) => {
    const rawSecret = process.env.JWT_SECRET || '';
    res.json({
        status: "up",
        db_type: process.env.DB_TYPE || 'mysql',
        env: process.env.NODE_ENV || 'development',
        mongo_uri_exists: !!(process.env.MONGODB_URI || process.env.MONGO_URI),
        jwt_secret_status: rawSecret ? `Present (Length: ${rawSecret.trim().length})` : "Missing (Using Fallback)",
        mysql_host: process.env.DB_HOST || 'localhost'
    });
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