const { verifyToken } = require('../utils/generateJWT');
const { isTokenBlacklisted } = require('../config/redis');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Authorization token required' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        // Check if token is blacklisted in Redis
        const blacklisted = await isTokenBlacklisted(decoded.jti);
        if (blacklisted) {
            return res.status(401).json({ success: false, message: 'Session expired or logged out' });
        }

        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Session expired' });
        }
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

module.exports = authMiddleware;
