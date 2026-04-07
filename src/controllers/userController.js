const db = require('../config/db');
const User = require('../models/User'); // MongoDB model
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register User
exports.registerUser = async (req, res) => {
    const { name, email, password, weight, height } = req.body;
    console.log("Registering user:", { name, email, dbType: process.env.DB_TYPE });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        if (process.env.DB_TYPE === 'mongodb') {
            const newUser = new User({ name, email, password: hashedPassword, weight, height });
            await newUser.save();
            res.json({ message: 'Registered successfully (MongoDB)' });
        } else {
            // MySQL
            const query = `
                INSERT INTO users (name, email, password, weight, height) 
                VALUES (?, ?, ?, ?, ?)
            `;
            db.query(query, [name, email, hashedPassword, weight, height], (err, result) => {
                if (err) {
                    console.error("MySQL Register Error:", err);
                    return res.status(500).json({ message: 'User already exists or error' });
                }
                res.json({ message: 'Registered successfully (MySQL)' });
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (process.env.DB_TYPE === 'mongodb') {
            const user = await User.findOne({ email });
            if (!user) return res.status(400).json({ message: 'User not found' });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

            const token = jwt.sign(
                { id: user._id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            res.json({
                message: 'Login successful (MongoDB)',
                token: token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    weight: user.weight,
                    height: user.height
                }
            });
        } else {
            // MySQL
            const query = `SELECT * FROM users WHERE email = ?`;
            db.query(query, [email], async (err, results) => {
                if (err) return res.status(500).json({ message: 'Server error' });
                if (results.length === 0) return res.status(400).json({ message: 'User not found' });

                const user = results[0];
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

                const token = jwt.sign(
                    { id: user.id, email: user.email },
                    process.env.JWT_SECRET,
                    { expiresIn: '1d' }
                );

                res.json({
                    message: 'Login successful (MySQL)',
                    token: token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        weight: user.weight,
                        height: user.height
                    }
                });
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get User
exports.getUser = async (req, res) => {
    const userId = req.user.id;

    try {
        if (process.env.DB_TYPE === 'mongodb') {
            const user = await User.findById(userId).select('-password');
            if (!user) return res.status(404).json({ message: 'User not found' });
            res.json({
                id: user._id,
                name: user.name,
                email: user.email,
                weight: user.weight,
                height: user.height
            });
        } else {
            // MySQL
            const query = `SELECT id, name, email, weight, height FROM users WHERE id = ?`;
            db.query(query, [userId], (err, results) => {
                if (err) return res.status(500).json({ message: 'Server error' });
                if (results.length === 0) return res.status(404).json({ message: 'User not found' });
                res.json(results[0]);
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update User
exports.updateUser = async (req, res) => {
    const userId = req.params.id;

    if (req.user.id != userId) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    const { name, email, weight, height } = req.body;

    try {
        if (process.env.DB_TYPE === 'mongodb') {
            await User.findByIdAndUpdate(userId, { name, email, weight, height });
            res.json({ message: 'Profile updated successfully (MongoDB)' });
        } else {
            // MySQL
            const query = `
                UPDATE users 
                SET name = ?, email = ?, weight = ?, height = ?
                WHERE id = ?
            `;
            db.query(query, [name, email, weight, height, userId], (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: 'Update failed' });
                }
                res.json({ message: 'Profile updated successfully (MySQL)' });
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};