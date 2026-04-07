const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const mealRoutes = require('./routes/mealRoutes'); // ✅ ADD THIS

require('./config/db'); // 👈 connect DB

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api', profileRoutes);
app.use('/api', mealRoutes); // ✅ ADD THIS


app.get('/', (req, res) => {
    res.send('Food Analysis API Running...');
});

module.exports = app;