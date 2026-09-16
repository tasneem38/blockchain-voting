const mongoose = require('mongoose');
const Candidate = require('../models/Candidate');
const AuditLog = require('../models/AuditLog');
const Booth = require('../models/Booth');
const { getResultsFromChain, isElectionOpen } = require('../utils/blockchainService');

/**
 * Compile election results from Blockchain and Audit Logs
 */
const getResults = async (req, res) => {
    try {
        // 1. Get all registered candidates from MongoDB
        const allCandidates = await Candidate.find().populate('boothId');

        // 2. Fetch real-time counts from Blockchain
        let chainResultsMap = {};
        try {
            const chainResults = await getResultsFromChain();
            if (Array.isArray(chainResults)) {
                chainResults.forEach(r => {
                    if (r.candidateId) {
                        chainResultsMap[r.candidateId.toUpperCase()] = r.voteCount;
                    }
                });
            }
        } catch (e) {
            console.warn('Blockchain getResults fallback to DB:', e.message);
        }

        // 3. Count votes from AuditLog as fallback / verification
        const auditVoteCounts = await AuditLog.aggregate([
            { $match: { action: 'VOTE_CAST', success: true } },
            { $group: { _id: { $toUpper: '$candidateId' }, count: { $sum: 1 } } }
        ]);
        const auditMap = {};
        auditVoteCounts.forEach(a => {
            if (a._id) auditMap[a._id] = a.count;
        });

        // 4. Map candidate details and calculate vote counts
        const results = allCandidates.map(c => {
            const cId = (c.candidateId || '').toUpperCase();
            // Use chain vote count if available (>0), otherwise fall back to audit log vote count
            const voteCount = (chainResultsMap[cId] !== undefined && chainResultsMap[cId] > 0)
                ? chainResultsMap[cId]
                : (auditMap[cId] || 0);

            return {
                candidateId: c.candidateId,
                name: c.name,
                party: c.party,
                boothId: c.boothId ? c.boothId.boothId : null,
                voteCount,
                votes: voteCount // for frontend compatibility
            };
        });

        const totalVotes = results.reduce((sum, r) => sum + r.voteCount, 0);

        // Calculate percentages
        const resultsWithPercent = results.map(r => ({
            ...r,
            percentage: totalVotes > 0 ? ((r.voteCount / totalVotes) * 100).toFixed(1) : '0.0'
        }));

        // 5. Build detailed booth-level breakdown
        const boothBreakdownRaw = await AuditLog.aggregate([
            { $match: { action: 'VOTE_CAST', success: true } },
            { 
                $group: { 
                    _id: { boothId: '$boothId', candidateId: '$candidateId' }, 
                    votes: { $sum: 1 } 
                } 
            }
        ]);

        const boothBreakdown = await Promise.all(boothBreakdownRaw.map(async (item) => {
            const candidate = await Candidate.findOne({ 
                candidateId: item._id.candidateId ? item._id.candidateId.toUpperCase() : '' 
            });

            // Try to find booth details
            let boothName = item._id.boothId || 'General Booth';
            if (item._id.boothId && mongoose.Types.ObjectId.isValid(item._id.boothId)) {
                const b = await Booth.findById(item._id.boothId);
                if (b) boothName = `${b.boothId} (${b.location})`;
            }

            return {
                boothId: boothName,
                candidateId: item._id.candidateId || 'N/A',
                candidateName: candidate ? candidate.name : (item._id.candidateId || 'Unknown'),
                votes: item.votes
            };
        }));

        const isOpen = await isElectionOpen();

        return res.status(200).json({
            success: true,
            results: resultsWithPercent,
            totalVotes,
            boothBreakdown,
            electionOpen: isOpen
        });

    } catch (err) {
        console.error('Fetch Results Error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to compile results: ' + err.message });
    }
};

module.exports = { getResults };

