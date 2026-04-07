const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    calories: { type: Number },
    protein: { type: Number },
    fat: { type: Number },
    carbs: { type: Number },
    createdAt: { type: Date, default: Date.now }
}, { bufferCommands: false });

module.exports = mongoose.model('Food', FoodSchema);
