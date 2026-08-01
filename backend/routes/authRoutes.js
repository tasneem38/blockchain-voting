const express = require('express');
const { body } = require('express-validator');
const { login, verifyOTP, logout, resendOTP } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { loginLimiter, otpLimiter, resendOTPLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/login',
    loginLimiter,
    [
        body('voterId').notEmpty().withMessage('Voter ID is required').isLength({ min: 5 }).withMessage('Voter ID too short'),
        body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password too short')
    ],
    login
);

router.post('/verify-otp',
    otpLimiter,
    [
        body('voterId').notEmpty(),
        body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
    ],
    verifyOTP
);

router.post('/logout', authMiddleware, logout);

router.post('/resend-otp', resendOTPLimiter, resendOTP);

module.exports = router;
