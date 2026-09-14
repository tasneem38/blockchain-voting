const { validationResult } = require('express-validator');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { setOTP, getOTP, deleteOTP, incrementOTPAttempts, getOTPAttempts, blacklistToken } = require('../config/redis');
const generateOTP = require('../utils/generateOTP');
const sendOTPEmail = require('../utils/sendEmail');
const { generateToken } = require('../utils/generateJWT');
const { logAction } = require('../middleware/auditLogger');

/**
 * Handle Voter Login - Phase 1: Identity & OTP Generation
 */
const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { voterId, password } = req.body;

    try {
        let user = await User.findOne({ voterId: voterId.trim().toUpperCase() });
        let isAdmin = false;

        if (!user) {
            user = await Admin.findOne({ adminId: voterId.trim().toUpperCase() });
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
            isAdmin = true;
        }

        if (!isAdmin) {
            // Check account lockout
            if (user.isLocked) {
                if (user.lockedUntil && user.lockedUntil > Date.now()) {
                    return res.status(423).json({ 
                        success: false, 
                        message: `Account locked until ${user.lockedUntil.toLocaleTimeString()}. Try again later.` 
                    });
                } else {
                    // Auto-unlock
                    await user.resetLoginAttempts();
                }
            }
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            if (!isAdmin) {
                await user.incrementLoginAttempts();
                if (user.isLocked) {
                    await logAction('ACCOUNT_LOCKED', voterId, 'VOTER', { success: false, ipAddress: req.ip });
                    return res.status(423).json({ success: false, message: 'Too many failed attempts. Account locked for 30 minutes.' });
                }
            }
            await logAction('LOGIN_FAILED', voterId, isAdmin ? 'ADMIN' : 'VOTER', { success: false, ipAddress: req.ip });
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Identity verified, generate OTP
        const otp = generateOTP();
        await setOTP(voterId, otp, 300); // 5 min TTL

        // Send OTP — admin/booth roles print to terminal only; real voter emails get delivered
        const userRole = isAdmin ? (user.role || 'ADMIN') : 'VOTER';
        await sendOTPEmail(user.email, voterId, otp, userRole);
        await logAction('OTP_SENT', voterId, userRole, { success: true, ipAddress: req.ip });

        return res.status(200).json({ 
            success: true, 
            message: 'OTP sent to registered email', 
            voterId 
        });

    } catch (err) {
        console.error('Login error:', err.message);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Handle Voter Login - Phase 2: OTP Verification & JWT Issuance
 */
const verifyOTP = async (req, res) => {
    const { voterId, otp } = req.body;

    if (!voterId || !otp) {
        return res.status(400).json({ success: false, message: 'Voter ID and OTP are required' });
    }

    try {
        let user = await User.findOne({ voterId: voterId.trim().toUpperCase() });
        let isAdmin = false;

        if (!user) {
            user = await Admin.findOne({ adminId: voterId.trim().toUpperCase() });
            if (!user) return res.status(404).json({ success: false, message: 'User not found' });
            isAdmin = true;
        }

        // Check attempts
        const attempts = await getOTPAttempts(voterId);
        if (attempts >= 3) {
            await deleteOTP(voterId);
            return res.status(429).json({ success: false, message: 'Too many OTP attempts. Please login again.' });
        }

        const storedOtp = await getOTP(voterId);
        if (!storedOtp) {
            return res.status(410).json({ success: false, message: 'OTP expired. Please login again.' });
        }

        if (otp !== storedOtp) {
            const currentAttempts = await incrementOTPAttempts(voterId);
            await logAction('OTP_FAILED', voterId, isAdmin ? 'ADMIN' : 'VOTER', { success: false, ipAddress: req.ip });
            return res.status(401).json({ 
                success: false, 
                message: `Invalid OTP. ${3 - currentAttempts} attempts remaining.` 
            });
        }

        if (!isAdmin && user.hasVoted) {
            return res.status(403).json({ success: false, message: 'You have already voted' });
        }

        // Verification successful
        await deleteOTP(voterId);
        if (!isAdmin) {
            await user.resetLoginAttempts();
        }

        await logAction('LOGIN_SUCCESS', voterId, isAdmin ? 'ADMIN' : 'VOTER', { success: true, ipAddress: req.ip });

        if (isAdmin) {
            const token = generateToken({ 
                id: user._id, 
                adminId: user.adminId, 
                role: user.role 
            }, user.role);

            return res.status(200).json({
                success: true,
                token,
                admin: { adminId: user.adminId, role: user.role }
            });
        } else {
            const token = generateToken({ 
                id: user._id, 
                voterId, 
                boothId: user.boothId 
            }, 'VOTER');

            return res.status(200).json({
                success: true,
                token,
                voter: { voterId, boothId: user.boothId, hasVoted: user.hasVoted }
            });
        }

    } catch (err) {
        console.error('OTP Verification error:', err.message);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Handle Logout - Blacklist token
 */
const logout = async (req, res) => {
    try {
        const { jti, exp } = req.user;
        const now = Math.floor(Date.now() / 1000);
        const ttl = Math.max(0, exp - now);

        await blacklistToken(jti, ttl);
        await logAction('LOGOUT', req.user.voterId || req.user.adminId, req.user.role);

        return res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Logout failed' });
    }
};

/**
 * Resend OTP
 */
const resendOTP = async (req, res) => {
    const { voterId } = req.body;
    try {
        const user = await User.findOne({ voterId: voterId?.trim().toUpperCase() });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        await deleteOTP(voterId);
        // Reset attempts for resend
        // await redis.del(`otp_attempts:${voterId}`); 
        
        const otp = generateOTP();
        await setOTP(voterId, otp, 300);
        await sendOTPEmail(user.email, voterId, otp, 'VOTER');
        await logAction('OTP_SENT', voterId, 'VOTER', { success: true, metadata: { type: 'resend' } });

        return res.status(200).json({ success: true, message: 'OTP resent' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Resend failed' });
    }
};

/**
 * Get Current Logged-in User Profile (with Booth & Karnataka Regional Details)
 */
const getMe = async (req, res) => {
    try {
        if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN' || req.user.role === 'BOOTH_ADMIN') {
            const admin = await Admin.findById(req.user.id).populate('boothId');
            return res.status(200).json({ success: true, admin });
        }

        const user = await User.findById(req.user.id).populate('boothId');
        if (!user) return res.status(404).json({ success: false, message: 'Voter not found' });

        return res.status(200).json({
            success: true,
            voter: {
                id: user._id,
                voterId: user.voterId,
                fullName: user.fullName || 'Registered Voter',
                epicNumber: user.epicNumber || `KA/01/172/${user.voterId}`,
                aadhaarLast4: user.aadhaarLast4 || 'XXXX',
                email: user.email,
                hasVoted: user.hasVoted,
                txHash: user.txHash,
                booth: user.boothId
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
    }
};

module.exports = { login, verifyOTP, logout, resendOTP, getMe };
