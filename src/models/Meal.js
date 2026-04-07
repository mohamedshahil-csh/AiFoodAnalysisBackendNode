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
});

// Since the user might be using a numeric ID from MySQL, 
// I'll add a field to store it if needed, or just rely on ObjectId.
// For now, let's keep it standard.

module.exports = mongoose.model('Meal', MealSchema);
