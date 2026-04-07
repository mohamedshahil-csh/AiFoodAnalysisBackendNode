const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        if (process.env.DB_TYPE === 'mongodb') {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('MongoDB Connected...');
        }
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        // Do not exit process, just log error so MySQL can still work if it's the fallback
    }
};

module.exports = connectDB;
