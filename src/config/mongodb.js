const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        if (process.env.DB_TYPE === 'mongodb') {
            const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
            if (!uri) {
                console.error('MongoDB URI is missing in .env');
                return;
            }
            await mongoose.connect(uri);
            console.log('MongoDB Connected...');
        }
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        // Do not exit process, just log error so MySQL can still work if it's the fallback
    }
};

module.exports = connectDB;
