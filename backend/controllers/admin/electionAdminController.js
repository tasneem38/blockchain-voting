const { isElectionOpen, openElectionOnChain, closeElectionOnChain } = require('../../utils/blockchainService');
const { logAction } = require('../../middleware/auditLogger');
const User = require('../../models/User');

const openElection = async (req, res) => {
    const { durationHours } = req.body;
    try {
        const isOpen = await isElectionOpen();
        if (isOpen) return res.status(400).json({ success: false, message: 'Election already open' });

        const durationSeconds = (durationHours || 24) * 3600;
        const txHash = await openElectionOnChain(durationSeconds);

        await logAction('ELECTION_OPENED', req.user.adminId, 'ADMIN', { txHash });
        
        const { io } = require('../../server');
        if (io) io.emit('election:status', { status: 'OPEN' });

        return res.status(200).json({ success: true, txHash, message: 'Election opened' });
    } catch (err) {
        console.error('Open election error:', err.message, err.stack);
        return res.status(500).json({ success: false, message: err.message || 'Failed to open election' });
    }
};

const closeElection = async (req, res) => {
    try {
        const isOpen = await isElectionOpen();
        if (!isOpen) return res.status(400).json({ success: false, message: 'Election not open' });

        const txHash = await closeElectionOnChain();

        await logAction('ELECTION_CLOSED', req.user.adminId, 'ADMIN', { txHash });

        const { io } = require('../../server');
        if (io) io.emit('election:status', { status: 'CLOSED' });

        return res.status(200).json({ success: true, txHash, message: 'Election closed' });
    } catch (err) {
        console.error('Close election error:', err.message, err.stack);
        return res.status(500).json({ success: false, message: err.message || 'Failed to close election' });
    }
};

const getElectionStatus = async (req, res) => {
    try {
        const isOpen = await isElectionOpen();
        const totalVoters = await User.countDocuments();
        const votesCast = await User.countDocuments({ hasVoted: true });
        const turnoutPercent = totalVoters > 0 ? ((votesCast / totalVoters) * 100).toFixed(1) : 0;

        return res.status(200).json({ 
            success: true, 
            isOpen, 
            totalVoters, 
            votesCast, 
            turnoutPercent 
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to fetch election status' });
    }
};

module.exports = { openElection, closeElection, getElectionStatus };
