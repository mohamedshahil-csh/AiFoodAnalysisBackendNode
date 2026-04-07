const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dish_name: { type: String, required: true },
    calories: { type: Number },
    health_score: { type: Number },
    verdict: { type: String },
    caution_reason: { type: String },
    full_json: { type: mongoose.Schema.Types.Mixed }, // Stores the full analysis data
    createdAt: { type: Date, default: Date.now }
}, { bufferCommands: false });

module.exports = mongoose.model('Meal', MealSchema);
