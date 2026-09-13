const User = require('../../models/User');
const Booth = require('../../models/Booth');

const getOverview = async (req, res) => {
    try {
        const { constituency, boothId } = req.query;

        // Build booth query filter
        let boothQuery = {};
        if (constituency) boothQuery.constituency = constituency;
        if (boothId) boothQuery._id = boothId;

        // Find matching booth IDs
        const matchingBooths = await Booth.find(boothQuery).select('_id constituency');
        const boothIds = matchingBooths.map(b => b._id);

        // Build user query filter
        let userQuery = {};
        if (boothIds.length > 0) {
            userQuery.boothId = { $in: boothIds };
        } else if (constituency || boothId) {
            // No matching booths found for filter
            return res.status(200).json({
                totalVoters: 0,
                votesCast: 0,
                boothsActive: 0,
                turnout: 0,
                constituencies: await Booth.distinct('constituency'),
                booths: await Booth.find().select('_id boothId location constituency')
            });
        }

        const totalVoters = await User.countDocuments(userQuery);
        const votesCast = await User.countDocuments({ ...userQuery, hasVoted: true });
        const allBoothsCount = await Booth.countDocuments(boothQuery);
        const turnout = totalVoters > 0 ? ((votesCast / totalVoters) * 100).toFixed(1) : 0;

        // Distinct list of constituencies and booths for dropdowns
        const constituencies = await Booth.distinct('constituency');
        const allBooths = await Booth.find().select('_id boothId location constituency');

        return res.status(200).json({
            totalVoters,
            votesCast,
            boothsActive: allBoothsCount,
            turnout,
            constituencies,
            booths: allBooths
        });
    } catch (err) {
        console.error('Get Overview Error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch overview metrics' });
    }
};

module.exports = { getOverview };
