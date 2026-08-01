const User = require('../models/User');
const Candidate = require('../models/Candidate');
const { castVoteOnChain, hasVotedOnChain, isElectionOpen } = require('../utils/blockchainService');
const { logAction } = require('../middleware/auditLogger');

/**
 * Cast a vote for a candidate
 */
const castVote = async (req, res) => {
    const { candidateId } = req.body;
    const { voterId, boothId, id: userId } = req.user;

    if (!candidateId) {
        return res.status(400).json({ success: false, message: 'Candidate ID is required' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'Voter not found' });

        // 1. Check if already voted in DB
        if (user.hasVoted) {
            return res.status(403).json({ success: false, message: 'You have already voted' });
        }

        // 2. Check if election is active
        const isOpen = await isElectionOpen();
        if (!isOpen) {
            return res.status(403).json({ success: false, message: 'Election is not open' });
        }

        // 3. Validate candidate and booth alignment
        const candidate = await Candidate.findOne({ candidateId: candidateId.toUpperCase() });
        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' });
        }

        if (candidate.boothId.toString() !== user.boothId.toString()) {
            return res.status(403).json({ success: false, message: 'This candidate is not registered for your booth' });
        }

        // 4. Double check blockchain for previous vote
        const alreadyVotedOnChain = await hasVotedOnChain(user.walletAddress || userId);
        if (alreadyVotedOnChain) {
            return res.status(403).json({ success: false, message: 'Already voted on blockchain' });
        }

        // 5. Submit to Blockchain
        const { txHash } = await castVoteOnChain(
            user.walletAddress || userId, 
            candidateId, 
            user.boothId.toString()
        );

        // 6. Update local DB
        user.hasVoted = true;
        user.txHash = txHash;
        await user.save();

        // 7. Log and Notify
        await logAction('VOTE_CAST', voterId, 'VOTER', { 
            txHash, 
            candidateId, 
            boothId: user.boothId, 
            success: true 
        });

        // Emit socket update (io will be imported in server.js)
        const { io } = require('../server');
        if (io) {
            io.emit('vote:update', { boothId: user.boothId, candidateId });
        }

        return res.status(200).json({ 
            success: true, 
            txHash, 
            message: 'Vote recorded successfully on blockchain' 
        });

    } catch (err) {
        console.error('Vote Casting Error:', err.message);
        await logAction('VOTE_REJECTED', voterId, 'VOTER', { 
            success: false, 
            errorMessage: err.message,
            candidateId 
        });
        return res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * Get current voter's status
 */
const getVoteStatus = async (req, res) => {
    try {
        const user = await User.findOne({ voterId: req.user.voterId });
        return res.status(200).json({ 
            success: true,
            hasVoted: user.hasVoted, 
            txHash: user.txHash 
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to fetch status' });
    }
};

module.exports = { castVote, getVoteStatus };
