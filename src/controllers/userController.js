const getDB = require('../config/db');
const User = require('../models/User'); // MongoDB model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
exports.registerUser = async (req, res) => {
    const { name, email, password, weight, height } = req.body;
    const dbType = (process.env.DB_TYPE || 'mysql').trim();
    console.log("Registering user:", { name, email, dbType });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        if (dbType === 'mongodb') {
            const newUser = new User({ name, email, password: hashedPassword, weight, height });
            const savedUser = await newUser.save();
            return res.json({ 
                message: 'Registered successfully (MongoDB)',
                user: { id: savedUser._id, name, email } 
            });
        } else {
            // MySQL (Promise-based for Express 5 support)
            const query = `
                INSERT INTO users (name, email, password, weight, height) 
                VALUES (?, ?, ?, ?, ?)
            `;
            try {
                // Using db.promise() to ensure async/await works correctly
                await getDB().promise().query(query, [name, email, hashedPassword, weight, height]);
                return res.json({ message: 'Registered successfully (MySQL)' });
            } catch (err) {
                console.error("MySQL Register Error:", err);
                return res.status(500).json({ message: 'User already exists or database error' });
            }
        }
    } catch (error) {
        console.error("Register Controller Error:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    const dbType = (process.env.DB_TYPE || 'mysql').trim();
    console.log("Logging in user:", { email, dbType });

    try {
        console.log("Login Step 1: Checking user existence...");
        if (dbType === 'mongodb') {
            const user = await User.findOne({ email });
            if (!user) {
                console.log("Login Error: User not found (MongoDB)");
                return res.status(400).json({ message: 'User not found' });
            }

            console.log("Login Step 2: Comparing passwords (bcryptjs)...");
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                console.log("Login Error: Invalid password (MongoDB)");
                return res.status(400).json({ message: 'Invalid password' });
            }

            console.log("Login Step 3: Generating token...");
            const token = jwt.sign(
                { id: user._id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            console.log("Login Success: Sending response (MongoDB)");
            return res.json({
                message: 'Login successful (MongoDB)',
                token: token,
                user: { id: user._id, name: user.name, email: user.email, weight: user.weight, height: user.height }
            });
        } else {
            console.log("Login Step 1: Querying MySQL...");
            const query = `SELECT * FROM users WHERE email = ?`;
            const [results] = await getDB().promise().query(query, [email]);

            if (results.length === 0) {
                console.log("Login Error: User not found (MySQL)");
                return res.status(400).json({ message: 'User not found' });
            }

            const user = results[0];
            console.log("Login Step 2: Comparing passwords (bcryptjs)...");
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                console.log("Login Error: Invalid password (MySQL)");
                return res.status(400).json({ message: 'Invalid password' });
            }

            console.log("Login Step 3: Generating token...");
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            console.log("Login Success: Sending response (MySQL)");
            return res.json({
                message: 'Login successful (MySQL)',
                token: token,
                user: { id: user.id, name: user.name, email: user.email, weight: user.weight, height: user.height }
            });
        }
    } catch (error) {
        console.error("Login Controller Critical Error:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get User
exports.getUser = async (req, res) => {
    const userId = req.user.id;
    const dbType = (process.env.DB_TYPE || 'mysql').trim();

    try {
        if (dbType === 'mongodb') {
            const user = await User.findById(userId).select('-password');
            if (!user) return res.status(404).json({ message: 'User not found' });
            return res.json({
                id: user._id,
                name: user.name,
                email: user.email,
                weight: user.weight,
                height: user.height
            });
        } else {
            // MySQL
            const query = `SELECT id, name, email, weight, height FROM users WHERE id = ?`;
            const [results] = await getDB().promise().query(query, [userId]);
            
            if (results.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.json(results[0]);
        }
    } catch (error) {
        console.error("Get User Error:", error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Update User
exports.updateUser = async (req, res) => {
    const userId = req.params.id;
    const dbType = (process.env.DB_TYPE || 'mysql').trim();

    if (req.user.id != userId) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    const { name, email, weight, height } = req.body;

    try {
        if (dbType === 'mongodb') {
            await User.findByIdAndUpdate(userId, { name, email, weight, height });
            return res.json({ message: 'Profile updated successfully (MongoDB)' });
        } else {
            // MySQL
            const query = `
                UPDATE users 
                SET name = ?, email = ?, weight = ?, height = ?
                WHERE id = ?
            `;
            await getDB().promise().query(query, [name, email, weight, height, userId]);
            return res.json({ message: 'Profile updated successfully (MySQL)' });
        }
    } catch (error) {
        console.error("Update User Error:", error);
        return res.status(500).json({ message: 'Server error' });
    }
};