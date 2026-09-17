const rateLimit = require('express-rate-limit');
const isDev = process.env.NODE_ENV !== 'production';

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: isDev ? 1000 : 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});

const loginLimiter = rateLimit({
    windowMs: isDev ? 1 * 60 * 1000 : 15 * 60 * 1000,
    limit: isDev ? 100 : 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Too many login attempts from this IP, please try again after 1 minute' }
});

const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: isDev ? 100 : 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Too many OTP attempts, please try again after 5 minutes' }
});

const resendOTPLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: isDev ? 50 : 3,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Too many OTP resend requests, please try again after 15 minutes' }
});

module.exports = { apiLimiter, loginLimiter, otpLimiter, resendOTPLimiter };
