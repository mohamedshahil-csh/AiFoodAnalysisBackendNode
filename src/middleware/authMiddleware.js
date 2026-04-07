const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Check Bearer format
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Invalid token format' });
        }

        const token = authHeader.split(' ')[1];

        const secret = (process.env.JWT_SECRET || 'fallback_secret').trim();

        const decoded = jwt.verify(token, secret);

        req.user = decoded;

        next();
    } catch (error) {
        console.log("JWT ERROR:", error.message);
        return res.status(401).json({ message: 'Invalid token' });
    }
};