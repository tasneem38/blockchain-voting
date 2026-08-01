const { validationResult } = require('express-validator');
const User = require('../../models/User');
const Booth = require('../../models/Booth');
const { logAction } = require('../../middleware/auditLogger');

/**
 * List all voters with pagination and filters
 */
const getVoters = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const hasVoted = req.query.hasVoted;
        const boothId = req.query.boothId;

        const filter = {};
        if (search) {
            filter.$or = [
                { voterId: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (hasVoted !== undefined) filter.hasVoted = hasVoted === 'true';
        if (boothId) filter.boothId = boothId;

        const voters = await User.find(filter)
            .select('-password')
            .populate('boothId', 'boothId location')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await User.countDocuments(filter);

        return res.status(200).json({
            success: true,
            voters,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to fetch voters' });
    }
};

/**
 * Register a new voter
 */
const createVoter = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { voterId, password, email, boothId } = req.body;

    try {
        const exists = await User.findOne({ $or: [{ voterId: voterId.toUpperCase() }, { email: email.toLowerCase() }] });
        if (exists) {
            return res.status(409).json({ success: false, message: 'Voter ID or Email already exists' });
        }

        const booth = await Booth.findById(boothId);
        if (!booth) return res.status(400).json({ success: false, message: 'Invalid Booth ID' });

        const voter = await User.create({
            voterId: voterId.toUpperCase(),
            password,
            email: email.toLowerCase(),
            boothId
        });

        // Update booth count
        booth.voterCount += 1;
        await booth.save();

        await logAction('ADMIN_ADD_VOTER', req.user.adminId, 'ADMIN', { 
            metadata: { voterId: voter.voterId, boothId: booth.boothId } 
        });

        return res.status(201).json({ success: true, voter: { _id: voter._id, voterId: voter.voterId } });

    } catch (err) {
        return res.status(500).json({ success: false, message: 'Voter creation failed' });
    }
};

/**
 * Delete a voter document
 */
const deleteVoter = async (req, res) => {
    try {
        const voter = await User.findById(req.params.id);
        if (!voter) return res.status(404).json({ success: false, message: 'Voter not found' });

        if (voter.hasVoted) {
            return res.status(400).json({ success: false, message: 'Cannot delete voter who has already voted' });
        }

        const boothId = voter.boothId;
        await User.findByIdAndDelete(req.params.id);

        // Decrement booth count
        await Booth.findByIdAndUpdate(boothId, { $inc: { voterCount: -1 } });

        await logAction('ADMIN_DELETE_VOTER', req.user.adminId, 'ADMIN', { 
            metadata: { voterId: voter.voterId } 
        });

        return res.status(200).json({ success: true, message: 'Voter deleted' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Deletion failed' });
    }
};

/**
 * Reset a voter's status (for testing or emergency use)
 */
const resetVoter = async (req, res) => {
    try {
        const voter = await User.findById(req.params.id);
        if (!voter) return res.status(404).json({ success: false, message: 'Voter not found' });

        voter.hasVoted = false;
        voter.txHash = null;
        voter.loginAttempts = 0;
        voter.isLocked = false;
        voter.lockedUntil = null;
        await voter.save();

        return res.status(200).json({ success: true, message: 'Voter status reset' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Reset failed' });
    }
};

module.exports = { getVoters, createVoter, deleteVoter, resetVoter };
