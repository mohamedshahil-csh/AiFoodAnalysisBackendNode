const db = require('../config/db');
const Profile = require('../models/Profile');

// ✅ SAVE PROFILE
exports.saveProfile = async (req, res) => {
    const userId = req.body.user_id;
    const d = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'user_id is required' });
    }

    try {
        if (process.env.DB_TYPE === 'mongodb') {
            const newProfile = new Profile({
                user_id: userId,
                ...d
            });
            await newProfile.save();
            res.json({ message: 'Profile saved ✅ (MongoDB)' });
        } else {
            // MySQL
            const query = `
                INSERT INTO patient_profiles (
                    user_id, age, gender, occupation, weight, height,
                    hba1c, fastingBloodSugar, postprandialSugar,
                    totalCholesterol, ldl, hdl, triglycerides,
                    bpSystolic, bpDiastolic,
                    egfr, creatinine, uricAcid,
                    tsh, hemoglobin, heartRate, spo2,
                    conditions, medications, allergies
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                userId,
                d.age, d.gender, d.occupation, d.weight, d.height,
                d.hba1c, d.fastingBloodSugar, d.postprandialSugar,
                d.totalCholesterol, d.ldl, d.hdl, d.triglycerides,
                d.bpSystolic, d.bpDiastolic,
                d.egfr, d.creatinine, d.uricAcid,
                d.tsh, d.hemoglobin, d.heartRate, d.spo2,
                d.conditions, d.medications, d.allergies
            ];

            db.query(query, values, (err) => {
                if (err) {
                    console.error("MySQL Save Profile Error:", err);
                    return res.status(500).json({ message: 'Save failed' });
                }
                res.json({ message: 'Profile saved ✅ (MySQL)' });
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ✅ GET LATEST PROFILE
exports.getProfile = async (req, res) => {
    const userId = req.user.id;

    try {
        if (process.env.DB_TYPE === 'mongodb') {
            const profile = await Profile.findOne({ user_id: userId }).sort({ createdAt: -1 });
            res.json(profile || {});
        } else {
            // MySQL
            db.query(
                "SELECT * FROM patient_profiles WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
                [userId],
                (err, results) => {
                    if (err) return res.status(500).json({ message: 'Error' });
                    res.json(results[0] || {});
                }
            );
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ✅ GET PROFILE BY ID
exports.getProfileById = async (req, res) => {
    const userId = req.params.id;

    try {
        if (process.env.DB_TYPE === 'mongodb') {
            const results = await Profile.find({ user_id: userId }).sort({ createdAt: -1 });
            if (results.length === 0) return res.status(404).json({ message: 'Profile not found' });
            res.json(results);
        } else {
            // MySQL
            db.query(
                "SELECT * FROM patient_profiles WHERE user_id = ? ORDER BY created_at DESC",
                [userId],
                (err, results) => {
                    if (err) return res.status(500).json({ message: 'Error' });
                    if (results.length === 0) return res.status(404).json({ message: 'Profile not found' });
                    res.json(results);
                }
            );
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ✅ GET ALL
exports.getAllProfiles = async (req, res) => {
    try {
        if (process.env.DB_TYPE === 'mongodb') {
            const results = await Profile.find().sort({ createdAt: -1 });
            res.json(results);
        } else {
            // MySQL
            db.query(
                "SELECT * FROM patient_profiles ORDER BY created_at DESC",
                (err, results) => {
                    if (err) return res.status(500).json({ message: 'Error' });
                    res.json(results);
                }
            );
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getLatestByUserId = async (req, res) => {
    const userId = req.params.user_id;

    try {
        if (process.env.DB_TYPE === 'mongodb') {
            const profile = await Profile.findOne({ user_id: userId }).sort({ createdAt: -1 });
            res.json(profile || {});
        } else {
            // MySQL
            db.query(
                `SELECT * FROM patient_profiles 
                 WHERE user_id = ? 
                 ORDER BY created_at DESC 
                 LIMIT 1`,
                [userId],
                (err, results) => {
                    if (err) return res.status(500).json({ message: 'Error' });
                    res.json(results[0] || {});
                }
            );
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllByUserId = async (req, res) => {
    const userId = req.params.user_id;

    try {
        if (process.env.DB_TYPE === 'mongodb') {
            const results = await Profile.find({ user_id: userId }).sort({ createdAt: -1 });
            res.json(results);
        } else {
            // MySQL
            db.query(
                `SELECT * FROM patient_profiles 
                 WHERE user_id = ? 
                 ORDER BY created_at DESC`,
                [userId],
                (err, results) => {
                    if (err) return res.status(500).json({ message: 'Error' });
                    res.json(results);
                }
            );
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getByDate = async (req, res) => {
    const userId = req.params.user_id;
    const { date } = req.query;

    try {
        if (process.env.DB_TYPE === 'mongodb') {
            const start = new Date(date);
            const end = new Date(date);
            end.setDate(end.getDate() + 1);

            const results = await Profile.find({
                user_id: userId,
                createdAt: { $gte: start, $lt: end }
            }).sort({ createdAt: -1 });
            res.json(results);
        } else {
            // MySQL
            db.query(
                `SELECT * FROM patient_profiles 
                 WHERE user_id = ? 
                 AND DATE(created_at) = ?
                 ORDER BY created_at DESC`,
                [userId, date],
                (err, results) => {
                    if (err) return res.status(500).json({ message: 'Error' });
                    res.json(results);
                }
            );
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getByRange = async (req, res) => {
    const userId = req.params.user_id;
    const { startDate, endDate } = req.query;

    try {
        if (process.env.DB_TYPE === 'mongodb') {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1);

            const results = await Profile.find({
                user_id: userId,
                createdAt: { $gte: start, $lt: end }
            }).sort({ createdAt: -1 });
            res.json(results);
        } else {
            // MySQL
            db.query(
                `SELECT * FROM patient_profiles 
                 WHERE user_id = ? 
                 AND DATE(created_at) BETWEEN ? AND ?
                 ORDER BY created_at DESC`,
                [userId, startDate, endDate],
                (err, results) => {
                    if (err) return res.status(500).json({ message: 'Error' });
                    res.json(results);
                }
            );
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getLatestLimit = async (req, res) => {
    const userId = req.params.user_id;
    const limit = parseInt(req.query.limit) || 5;

    try {
        if (process.env.DB_TYPE === 'mongodb') {
            const results = await Profile.find({ user_id: userId }).sort({ createdAt: -1 }).limit(limit);
            res.json(results);
        } else {
            // MySQL
            db.query(
                `SELECT * FROM patient_profiles 
                 WHERE user_id = ? 
                 ORDER BY created_at DESC 
                 LIMIT ?`,
                [userId, limit],
                (err, results) => {
                    if (err) return res.status(500).json({ message: 'Error' });
                    res.json(results);
                }
            );
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ✅ DELETE
exports.deleteProfile = async (req, res) => {
    const userId = req.user.id;

    try {
        if (process.env.DB_TYPE === 'mongodb') {
            await Profile.deleteMany({ user_id: userId });
            res.json({ message: 'Profile deleted (MongoDB)' });
        } else {
            // MySQL
            db.query(
                "DELETE FROM patient_profiles WHERE user_id = ?",
                [userId],
                (err) => {
                    if (err) return res.status(500).json({ message: 'Delete failed' });
                    res.json({ message: 'Profile deleted (MySQL)' });
                }
            );
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};