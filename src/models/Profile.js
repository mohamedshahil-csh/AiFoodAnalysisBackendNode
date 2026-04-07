const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    age: Number,
    gender: String,
    occupation: String,
    weight: Number,
    height: Number,
    hba1c: Number,
    fastingBloodSugar: Number,
    postprandialSugar: Number,
    totalCholesterol: Number,
    ldl: Number,
    hdl: Number,
    triglycerides: Number,
    bpSystolic: Number,
    bpDiastolic: Number,
    egfr: Number,
    creatinine: Number,
    uricAcid: Number,
    tsh: Number,
    hemoglobin: Number,
    heartRate: Number,
    spo2: Number,
    conditions: String,
    medications: String,
    allergies: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Profile', ProfileSchema);
