const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

/**
 * Generates a signed JWT
 * @param {Object} payload { id, voterId/adminId, boothId }
 * @param {string} role "VOTER" or "ADMIN"
 */
const generateToken = (payload, role) => {
    return jwt.sign(
        { 
            ...payload, 
            role,
            jti: uuidv4() // Unique ID for blacklisting
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '30m' }
    );
};

/**
 * Verifies a JWT
 * @param {string} token 
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        throw err;
    }
};

module.exports = { generateToken, verifyToken };
