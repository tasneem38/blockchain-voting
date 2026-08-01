const Candidate = require('../models/Candidate');
const AuditLog = require('../models/AuditLog');
const { getResultsFromChain, isElectionOpen } = require('../utils/blockchainService');

/**
 * Compile election results from Blockchain and Audit Logs
 */
const getResults = async (req, res) => {
    try {
        // 1. Get real-time counts from Blockchain
        const chainResults = await getResultsFromChain();
        const isOpen = await isElectionOpen();

        // 2. Map blockchain IDs to MongoDB candidate details
        const results = await Promise.all(chainResults.map(async (r) => {
            const candidate = await Candidate.findOne({ candidateId: r.candidateId });
            return {
                candidateId: r.candidateId,
                name: candidate ? candidate.name : 'Unknown',
                party: candidate ? candidate.party : 'Unknown',
                voteCount: r.voteCount
            };
        }));

        const totalVotes = results.reduce((sum, r) => sum + r.voteCount, 0);

        // Calculate percentages
        const resultsWithPercent = results.map(r => ({
            ...r,
            percentage: totalVotes > 0 ? ((r.voteCount / totalVotes) * 100).toFixed(1) : 0
        }));

        // 3. Get booth-level breakdown from Audit Logs (Verifiable local source)
        const boothBreakdown = await AuditLog.aggregate([
            { $match: { action: 'VOTE_CAST', success: true } },
            { $group: { _id: '$boothId', voteCount: { $sum: 1 } } },
            { $project: { boothId: '$_id', voteCount: 1, _id: 0 } }
        ]);

        return res.status(200).json({
            success: true,
            results: resultsWithPercent,
            totalVotes,
            boothBreakdown,
            electionOpen: isOpen
        });

    } catch (err) {
        console.error('Fetch Results Error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to compile results' });
    }
};

module.exports = { getResults };
