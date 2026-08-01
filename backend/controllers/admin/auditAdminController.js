const AuditLog = require('../../models/AuditLog');

const getAuditLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const { action, actorId, boothId, success, startDate, endDate } = req.query;

        const filter = {};
        if (action) filter.action = action;
        if (actorId) filter.actorId = actorId;
        if (boothId) filter.boothId = boothId;
        if (success !== undefined) filter.success = success === 'true';

        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) filter.timestamp.$gte = new Date(startDate);
            if (endDate) filter.timestamp.$lte = new Date(endDate);
        }

        const logs = await AuditLog.find(filter)
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await AuditLog.countDocuments(filter);

        return res.status(200).json({
            success: true,
            logs,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
    }
};

module.exports = { getAuditLogs };
