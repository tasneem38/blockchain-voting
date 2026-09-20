const Candidate = require('../models/Candidate');
const User = require('../models/User');

/**
 * Fetch candidates for the voter's assigned booth
 */
const getCandidates = async (req, res) => {
    try {
        const { boothId } = req.user;
        
        // Fetch candidates assigned to the voter's specific booth (or global candidates with no booth set)
        const filter = boothId ? { $or: [{ boothId }, { boothId: null }] } : {};
        const candidates = await Candidate.find(filter)
            .populate('boothId', 'location')
            .lean();

        return res.status(200).json({ 
            success: true, 
            candidates 
        });
    } catch (err) {
        console.error('Fetch Candidates Error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to load candidates' });
    }
};

module.exports = { getCandidates };
