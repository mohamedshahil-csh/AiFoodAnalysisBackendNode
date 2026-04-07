const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Register User
exports.registerUser = async (req, res) => {
    const { name, email, password, weight, height } = req.body; // ✅ added
    console.log("REQ BODY:", req.body); // 👈 ADD HERE

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO users (name, email, password, weight, height) 
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(query, [name, email, hashedPassword, weight, height], (err, result) => {
            if (err) {
                console.error("REAL ERROR:", err);
                return res.status(500).json({ message: 'User already exists or error' });
            }

            res.json({ message: 'Registered successfully' });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.loginUser = (req, res) => {
    const { email, password } = req.body;

    const query = `SELECT * FROM users WHERE email = ?`;

    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });

        if (results.length === 0) {
            return res.status(400).json({ message: 'User not found' });
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // 🔥 Generate JWT Token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login successful',
            token: token, // ✅ return token
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                weight: user.weight,
                height: user.height
            }
        });
    });
};

exports.getUser = (req, res) => {
    const userId = req.user.id;

    const query = `SELECT id, name, email, weight, height FROM users WHERE id = ?`;

    db.query(query, [userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(results[0]);
    });
};

exports.updateUser = (req, res) => {
    const userId = req.params.id;

    // ✅ ADD THIS HERE (after getting userId)
    if (req.user.id != userId) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    const { name, email, weight, height } = req.body;

    const query = `
        UPDATE users 
        SET name = ?, email = ?, weight = ?, height = ?
        WHERE id = ?
    `;

    db.query(
        query,
        [name, email, weight, height, userId],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Update failed' });
            }

            res.json({
                message: 'Profile updated successfully'
            });
        }
    );
};