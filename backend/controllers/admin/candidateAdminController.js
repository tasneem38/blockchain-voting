const Candidate = require('../../models/Candidate');
const { isElectionOpen } = require('../../utils/blockchainService');
const { logAction } = require('../../middleware/auditLogger');

const getCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.find().populate('boothId', 'boothId location');
        return res.status(200).json({ success: true, candidates });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to fetch candidates' });
    }
};

const createCandidate = async (req, res) => {
    const { candidateId, name, party, boothId, symbol } = req.body;
    try {
        const exists = await Candidate.findOne({ candidateId: candidateId.toUpperCase() });
        if (exists) return res.status(409).json({ success: false, message: 'Candidate ID already exists' });

        const candidate = await Candidate.create({
            candidateId: candidateId.toUpperCase(),
            name,
            party,
            boothId,
            symbol
        });

        await logAction('ADMIN_ADD_CANDIDATE', req.user.adminId, 'ADMIN', { 
            metadata: { candidateId: candidate.candidateId } 
        });

        return res.status(201).json({ success: true, candidate });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Candidate creation failed' });
    }
};

const deleteCandidate = async (req, res) => {
    try {
        const isOpen = await isElectionOpen();
        if (isOpen) {
            return res.status(400).json({ success: false, message: 'Cannot delete candidate while election is open' });
        }

        await Candidate.findByIdAndDelete(req.params.id);
        return res.status(200).json({ success: true, message: 'Candidate deleted' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Deletion failed' });
    }
};

module.exports = { getCandidates, createCandidate, deleteCandidate };
