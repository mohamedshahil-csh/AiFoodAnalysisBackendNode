const getDB = require('../config/db');
const Profile = require('../models/Profile');
const mongoose = require('mongoose');

// Save or Update Profile
exports.saveProfile = async (req, res) => {
    const { 
        user_id, age, gender, occupation, weight, height, 
        hba1c, fastingBloodSugar, postprandialSugar, 
        totalCholesterol, ldl, hdl, triglycerides, 
        bpSystolic, bpdiastolic, egfr, creatinine, 
        uricAcid, tsh, hemoglobin, heartRate, spo2, 
        conditions, medications, allergies 
    } = req.body;

    const dbType = (process.env.DB_TYPE || 'mysql').trim();

    try {
        if (dbType === 'mongodb') {
            let profile = await Profile.findOne({ user_id });
            if (profile) {
                profile = await Profile.findOneAndUpdate({ user_id }, req.body, { new: true });
                return res.json({ message: 'Profile updated successfully (MongoDB)', profile });
            } else {
                const newProfile = new Profile(req.body);
                const savedProfile = await newProfile.save();
                return res.status(201).json({ message: 'Profile created successfully (MongoDB)', profile: savedProfile });
            }
        } else {
            const checkQuery = `SELECT id FROM user_profiles WHERE user_id = ?`;
            const [results] = await getDB().promise().query(checkQuery, [user_id]);

            if (results.length > 0) {
                const updateQuery = `
                    UPDATE user_profiles 
                    SET age=?, gender=?, occupation=?, weight=?, height=?, hba1c=?, 
                        fastingBloodSugar=?, postprandialSugar=?, totalCholesterol=?, 
                        ldl=?, hdl=?, triglycerides=?, bpSystolic=?, bpdiastolic=?, 
                        egfr=?, creatinine=?, uricAcid=?, tsh=?, hemoglobin=?, 
                        heartRate=?, spo2=?, conditions=?, medications=?, allergies=?
                    WHERE user_id = ?
                `;
                await getDB().promise().query(updateQuery, [
                    age, gender, occupation, weight, height, hba1c, fastingBloodSugar, 
                    postprandialSugar, totalCholesterol, ldl, hdl, triglycerides, 
                    bpSystolic, bpdiastolic, egfr, creatinine, uricAcid, tsh, 
                    hemoglobin, heartRate, spo2, conditions, medications, allergies, user_id
                ]);
                return res.json({ message: 'Profile updated successfully (MySQL)' });
            } else {
                const insertQuery = `
                    INSERT INTO user_profiles 
                    (user_id, age, gender, occupation, weight, height, hba1c, fastingBloodSugar, 
                    postprandialSugar, totalCholesterol, ldl, hdl, triglycerides, bpSystolic, 
                    bpdiastolic, egfr, creatinine, uricAcid, tsh, hemoglobin, heartRate, spo2, 
                    conditions, medications, allergies) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                await getDB().promise().query(insertQuery, [
                    user_id, age, gender, occupation, weight, height, hba1c, fastingBloodSugar, 
                    postprandialSugar, totalCholesterol, ldl, hdl, triglycerides, bpSystolic, 
                    bpdiastolic, egfr, creatinine, uricAcid, tsh, hemoglobin, heartRate, spo2, 
                    conditions, medications, allergies
                ]);
                return res.status(201).json({ message: 'Profile created successfully (MySQL)' });
            }
        }
    } catch (error) {
        console.error("Profile Error:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Profile by User ID
exports.getProfile = async (req, res) => {
    const userId = req.user.id; // Corrected to use auth user
    const dbType = (process.env.DB_TYPE || 'mysql').trim();

    try {
        if (dbType === 'mongodb') {
            const profile = await Profile.findOne({ user_id: userId });
            return res.json(profile || {});
        } else {
            const query = `SELECT * FROM user_profiles WHERE user_id = ?`;
            const [results] = await getDB().promise().query(query, [userId]);
            return res.json(results[0] || {});
        }
    } catch (error) {
        console.error("Get Profile Error:", error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Delete Profile
exports.deleteProfile = async (req, res) => {
    const userId = req.user.id;
    const dbType = (process.env.DB_TYPE || 'mysql').trim();

    try {
        if (dbType === 'mongodb') {
            await Profile.findOneAndDelete({ user_id: userId });
            return res.json({ message: 'Profile deleted (MongoDB)' });
        } else {
            const query = `DELETE FROM user_profiles WHERE user_id = ?`;
            await getDB().promise().query(query, [userId]);
            return res.json({ message: 'Profile deleted (MySQL)' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting profile' });
    }
};

// Get Single Profile By ID
exports.getProfileById = async (req, res) => {
    const { id } = req.params;
    const dbType = (process.env.DB_TYPE || 'mysql').trim();

    try {
        if (dbType === 'mongodb') {
            const profile = await Profile.findById(id);
            return res.json(profile || {});
        } else {
            const [results] = await getDB().promise().query('SELECT * FROM user_profiles WHERE id = ?', [id]);
            return res.json(results[0] || {});
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error' });
    }
};

// Get All Profiles
exports.getAllProfiles = async (req, res) => {
    const dbType = (process.env.DB_TYPE || 'mysql').trim();

    try {
        if (dbType === 'mongodb') {
            const profiles = await Profile.find();
            return res.json(profiles);
        } else {
            const [results] = await getDB().promise().query('SELECT * FROM user_profiles');
            return res.json(results);
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error' });
    }
};

// --- History & Stats Functions ---
exports.getLatestByUserId = async (req, res) => {
    const { user_id } = req.params;
    const dbType = (process.env.DB_TYPE || 'mysql').trim();
    try {
        if (dbType === 'mongodb') {
            const data = await Profile.findOne({ user_id }).sort({ createdAt: -1 });
            return res.json(data || {});
        } else {
            const [results] = await getDB().promise().query('SELECT * FROM user_profiles WHERE user_id = ? ORDER BY createdAt DESC LIMIT 1', [user_id]);
            return res.json(results[0] || {});
        }
    } catch (err) { return res.status(500).json({ message: 'Error' }); }
};

exports.getAllByUserId = async (req, res) => {
    const { user_id } = req.params;
    const dbType = (process.env.DB_TYPE || 'mysql').trim();
    try {
        if (dbType === 'mongodb') {
            const data = await Profile.find({ user_id }).sort({ createdAt: -1 });
            return res.json(data);
        } else {
            const [results] = await getDB().promise().query('SELECT * FROM user_profiles WHERE user_id = ?', [user_id]);
            return res.json(results);
        }
    } catch (err) { return res.status(500).json({ message: 'Error' }); }
};

exports.getByDate = async (req, res) => {
    const { user_id } = req.params;
    const { date } = req.query;
    const dbType = (process.env.DB_TYPE || 'mysql').trim();
    try {
        if (dbType === 'mongodb') {
            const data = await Profile.find({ user_id, createdAt: { $gte: new Date(date) } });
            return res.json(data);
        } else {
            const [results] = await getDB().promise().query('SELECT * FROM user_profiles WHERE user_id = ? AND DATE(createdAt) = ?', [user_id, date]);
            return res.json(results);
        }
    } catch (err) { return res.status(500).json({ message: 'Error' }); }
};

exports.getByRange = async (req, res) => {
    const { user_id } = req.params;
    const { start, end } = req.query;
    const dbType = (process.env.DB_TYPE || 'mysql').trim();
    try {
        if (dbType === 'mongodb') {
            const data = await Profile.find({ user_id, createdAt: { $gte: new Date(start), $lte: new Date(end) } });
            return res.json(data);
        } else {
            const [results] = await getDB().promise().query('SELECT * FROM user_profiles WHERE user_id = ? AND createdAt BETWEEN ? AND ?', [user_id, start, end]);
            return res.json(results);
        }
    } catch (err) { return res.status(500).json({ message: 'Error' }); }
};

exports.getLatestLimit = async (req, res) => {
    const { user_id } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const dbType = (process.env.DB_TYPE || 'mysql').trim();
    try {
        if (dbType === 'mongodb') {
            const data = await Profile.find({ user_id }).sort({ createdAt: -1 }).limit(limit);
            return res.json(data);
        } else {
            const [results] = await getDB().promise().query('SELECT * FROM user_profiles WHERE user_id = ? ORDER BY createdAt DESC LIMIT ?', [user_id, limit]);
            return res.json(results);
        }
    } catch (err) { return res.status(500).json({ message: 'Error' }); }
};