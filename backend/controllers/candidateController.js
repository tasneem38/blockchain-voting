const Candidate = require('../models/Candidate');
const User = require('../models/User');

/**
 * Fetch candidates for the voter's assigned booth
 */
const getCandidates = async (req, res) => {
    try {
        const { boothId } = req.user;
        
        // Find all candidates registered for this specific booth
        const candidates = await Candidate.find({ boothId })
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
