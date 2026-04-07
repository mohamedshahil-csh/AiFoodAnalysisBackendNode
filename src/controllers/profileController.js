const db = require('../config/db');

// ✅ SAVE PROFILE (ALLOW DUPLICATES)
exports.saveProfile = (req, res) => {
    const userId = req.body.user_id;
    const d = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'user_id is required' });
    }

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
            console.error("SAVE ERROR:", err);
            return res.status(500).json({ message: 'Save failed' });
        }

        res.json({ message: 'Profile saved ✅' });
    });
};

// ✅ GET LATEST PROFILE
exports.getProfile = (req, res) => {
    const userId = req.user.id;

    db.query(
        "SELECT * FROM patient_profiles WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
        [userId],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Error' });

            res.json(results[0] || {});
        }
    );
};

// ✅ GET PROFILE BY ID
exports.getProfileById = (req, res) => {
    const userId = req.params.id;

    db.query(
        "SELECT * FROM patient_profiles WHERE user_id = ? ORDER BY created_at DESC",
        [userId],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Error' });

            if (results.length === 0) {
                return res.status(404).json({ message: 'Profile not found' });
            }

            res.json(results);
        }
    );
};

// ✅ GET ALL
exports.getAllProfiles = (req, res) => {
    db.query(
        "SELECT * FROM patient_profiles ORDER BY created_at DESC",
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Error' });

            res.json(results);
        }
    );
};
exports.getLatestByUserId = (req, res) => {
    const userId = req.params.user_id;

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
};
exports.getAllByUserId = (req, res) => {
    const userId = req.params.user_id;

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
};
exports.getByDate = (req, res) => {
    const userId = req.params.user_id;
    const { date } = req.query;

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
};
exports.getByRange = (req, res) => {
    const userId = req.params.user_id;
    const { startDate, endDate } = req.query;

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
};
exports.getLatestLimit = (req, res) => {
    const userId = req.params.user_id;
    const limit = parseInt(req.query.limit) || 5;

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
};
// ✅ DELETE
exports.deleteProfile = (req, res) => {
    const userId = req.user.id;

    db.query(
        "DELETE FROM patient_profiles WHERE user_id = ?",
        [userId],
        (err) => {
            if (err) return res.status(500).json({ message: 'Delete failed' });

            res.json({ message: 'Profile deleted' });
        }
    );
};