const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const mealRoutes = require('./routes/mealRoutes'); // ✅ ADD THIS

require('./config/db'); // 👈 connect MySQL
const connectDB = require('./config/mongodb'); // 👈 ADD THIS
connectDB(); // 👈 connect MongoDB (if DB_TYPE=mongodb)

const app = express();

app.use(cors());
app.use(express.json());

// 📝 LOG ALL REQUESTS
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use('/api/users', userRoutes);
app.use('/api', profileRoutes);
app.use('/api', mealRoutes); // ✅ ADD THIS


app.get('/', (req, res) => {
    res.send('Food Analysis API Running...');
});

// 🚨 GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
});

module.exports = app;