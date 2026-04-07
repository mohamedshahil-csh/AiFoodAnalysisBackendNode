const db = require('../config/db');


// SAVE MEAL
exports.saveMeal = (req, res) => {
    const userId = req.body.user_id;
    const data = req.body;

    const dishName = data.dishName;
    const calories = data.ingredients?.[0]?.calories || 0;
    const healthScore = data.overallHealthScore || 0;
    const verdict = data.clinicalSuitability?.verdict || "Safe";
    const reason = data.clinicalSuitability?.explanation || "";

    db.query(
        `INSERT INTO meal_history 
        (user_id,dish_name,calories,health_score,verdict,caution_reason,full_json)
        VALUES (?,?,?,?,?,?,?)`,
        [
            userId,
            dishName,
            calories,
            healthScore,
            verdict,
            reason,
            JSON.stringify(data)
        ],
        (err) => {
            if (err) return res.status(500).json({ message: "error" });
            res.json({ message: "saved" });
        }
    );
};


// GET ALL MEALS
exports.getMeals = (req, res) => {
    const userId = req.params.user_id;

    db.query(
        `SELECT 
            id,
            dish_name,
            calories,
            verdict,
            health_score,
            created_at
        FROM meal_history
        WHERE user_id = ?
        ORDER BY created_at DESC`,
        [userId],
        (err, results) => {
            if (err) return res.status(500).json({ message: "Error" });

            res.json(results);
        }
    );
};


// GET SINGLE MEAL (CLICK CAUTION)
exports.getMealById = (req, res) => {
    const id = req.params.id;

    db.query(
        `SELECT * FROM meal_history WHERE id = ?`,
        [id],
        (err, results) => {
            if (err) return res.status(500).json({ message: "Error" });

            res.json(results[0]);
        }
    );
};


// DELETE MEAL
exports.deleteMeal = (req, res) => {
    const id = req.params.id;

    db.query(
        `DELETE FROM meal_history WHERE id = ?`,
        [id],
        (err) => {
            if (err) return res.status(500).json({ message: "Delete failed" });

            res.json({ message: "Deleted successfully" });
        }
    );
};


// GET LATEST
exports.getLatestMeals = (req, res) => {
    const userId = req.params.user_id;
    const limit = parseInt(req.query.limit) || 5;

    db.query(
        `SELECT * FROM meal_history
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ?`,
        [userId, limit],
        (err, results) => {
            if (err) return res.status(500).json({ message: "Error" });

            res.json(results);
        }
    );
};


// GET BY DATE
exports.getMealsByDate = (req, res) => {
    const userId = req.params.user_id;
    const { date } = req.query;

    db.query(
        `SELECT * FROM meal_history
         WHERE user_id = ?
         AND DATE(created_at) = ?`,
        [userId, date],
        (err, results) => {
            if (err) return res.status(500).json({ message: "Error" });

            res.json(results);
        }
    );
};


// GET RANGE
exports.getMealsByRange = (req, res) => {
    const userId = req.params.user_id;
    const { startDate, endDate } = req.query;

    db.query(
        `SELECT * FROM meal_history
         WHERE user_id = ?
         AND DATE(created_at) BETWEEN ? AND ?`,
        [userId, startDate, endDate],
        (err, results) => {
            if (err) return res.status(500).json({ message: "Error" });

            res.json(results);
        }
    );
};


// GET LATEST LIMIT
exports.getLatestLimit = (req, res) => {
    const userId = req.params.user_id;
    const limit = parseInt(req.query.limit) || 5;

    db.query(
        `SELECT * FROM meal_history
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ?`,
        [userId, limit],
        (err, results) => {
            if (err) return res.status(500).json({ message: "Error" });

            res.json(results);
        }
    );
};