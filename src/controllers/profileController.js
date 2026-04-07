const db = require('../config/db');
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
                // Update
                profile = await Profile.findOneAndUpdate({ user_id }, req.body, { new: true });
                return res.json({ message: 'Profile updated successfully (MongoDB)', profile });
            } else {
                // Create
                const newProfile = new Profile(req.body);
                const savedProfile = await newProfile.save();
                return res.status(201).json({ message: 'Profile created successfully (MongoDB)', profile: savedProfile });
            }
        } else {
            // MySQL Promise-based
            const checkQuery = `SELECT id FROM user_profiles WHERE user_id = ?`;
            const [results] = await db.promise().query(checkQuery, [user_id]);

            if (results.length > 0) {
                // Update
                const updateQuery = `
                    UPDATE user_profiles 
                    SET age=?, gender=?, occupation=?, weight=?, height=?, hba1c=?, 
                        fastingBloodSugar=?, postprandialSugar=?, totalCholesterol=?, 
                        ldl=?, hdl=?, triglycerides=?, bpSystolic=?, bpdiastolic=?, 
                        egfr=?, creatinine=?, uricAcid=?, tsh=?, hemoglobin=?, 
                        heartRate=?, spo2=?, conditions=?, medications=?, allergies=?
                    WHERE user_id = ?
                `;
                await db.promise().query(updateQuery, [
                    age, gender, occupation, weight, height, hba1c, fastingBloodSugar, 
                    postprandialSugar, totalCholesterol, ldl, hdl, triglycerides, 
                    bpSystolic, bpdiastolic, egfr, creatinine, uricAcid, tsh, 
                    hemoglobin, heartRate, spo2, conditions, medications, allergies, user_id
                ]);
                return res.json({ message: 'Profile updated successfully (MySQL)' });
            } else {
                // Insert
                const insertQuery = `
                    INSERT INTO user_profiles 
                    (user_id, age, gender, occupation, weight, height, hba1c, fastingBloodSugar, 
                    postprandialSugar, totalCholesterol, ldl, hdl, triglycerides, bpSystolic, 
                    bpdiastolic, egfr, creatinine, uricAcid, tsh, hemoglobin, heartRate, spo2, 
                    conditions, medications, allergies) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                await db.promise().query(insertQuery, [
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

// Get Profile
exports.getProfile = async (req, res) => {
    const userId = req.params.user_id;
    const dbType = (process.env.DB_TYPE || 'mysql').trim();

    try {
        if (dbType === 'mongodb') {
            const profile = await Profile.findOne({ user_id: userId });
            return res.json(profile || {});
        } else {
            // MySQL Promise-based
            const query = `SELECT * FROM user_profiles WHERE user_id = ?`;
            const [results] = await db.promise().query(query, [userId]);
            return res.json(results[0] || {});
        }
    } catch (error) {
        console.error("Get Profile Error:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};