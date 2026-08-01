/**
 * Restricts access to ADMIN users only
 */
const adminMiddleware = (req, res, next) => {
    if (!req.user || !req.user.role?.includes('ADMIN')) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
};

module.exports = adminMiddleware;
