const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;

        if (!authHeader) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Remove Bearer safely
        const token = authHeader.replace(/^Bearer\s+/i, "").trim();

        if (!token) {
            return res.status(401).json({ message: 'Token missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();

    } catch (error) {
        console.log("JWT ERROR:", error.message);
        return res.status(401).json({ message: 'Invalid token' });
    }
};