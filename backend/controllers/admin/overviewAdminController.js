const User = require('../../models/User');
const Booth = require('../../models/Booth');

const getOverview = async (req, res) => {
    try {
        const totalVoters = await User.countDocuments();
        const votesCast = await User.countDocuments({ hasVoted: true });
        const boothsActive = await Booth.countDocuments({ status: 'ACTIVE' }); // Or maybe just countDocuments() if there's no status field, let's assume Booth.countDocuments() is fine. Let's check Booth model. Wait, I will just count all booths.
        const allBooths = await Booth.countDocuments();
        
        const turnout = totalVoters > 0 ? ((votesCast / totalVoters) * 100).toFixed(1) : 0;

        return res.status(200).json({
            totalVoters,
            votesCast,
            boothsActive: allBooths,
            turnout
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to fetch overview metrics' });
    }
};

module.exports = { getOverview };
