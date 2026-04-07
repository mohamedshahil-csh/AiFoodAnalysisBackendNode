const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    weight: { type: Number },
    height: { type: Number },
    createdAt: { type: Date, default: Date.now }
}, { bufferCommands: false });

module.exports = mongoose.model('User', UserSchema);
