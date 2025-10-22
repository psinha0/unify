const jwt = require('jsonwebtoken');
const { verifyToken } = require('../utils/auth');
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const decoded = verifyToken(token);
        // Make the userId available to all routes
        req.userId = decoded.id;
        next();
    } catch (error) {
        // Only log non-expiration errors to avoid console spam
        if (error.name !== 'TokenExpiredError') {
        }
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
module.exports = authMiddleware;