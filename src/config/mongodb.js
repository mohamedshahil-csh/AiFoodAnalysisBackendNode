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
            // 🚀 DISABLE BUFFERING & SET TIMEOUT
            mongoose.set('bufferCommands', false); 
            await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 5000, // 5 seconds timeout
                connectTimeoutMS: 10000 // 10 seconds connection timeout
            });
            console.log('MongoDB Connected...');
        }
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        // Do not exit process, just log error so MySQL can still work if it's the fallback
    }
};

module.exports = connectDB;
