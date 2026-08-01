const Booth = require('../../models/Booth');
const { logAction } = require('../../middleware/auditLogger');

const getBooths = async (req, res) => {
    try {
        const booths = await Booth.find().sort({ boothId: 1 });
        return res.status(200).json({ success: true, booths });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to fetch booths' });
    }
};

const createBooth = async (req, res) => {
    const { boothId, location } = req.body;
    try {
        const exists = await Booth.findOne({ boothId: boothId.toUpperCase() });
        if (exists) return res.status(409).json({ success: false, message: 'Booth ID already exists' });

        const booth = await Booth.create({
            boothId: boothId.toUpperCase(),
            location
        });

        await logAction('ADMIN_ADD_BOOTH', req.user.adminId, 'ADMIN', { 
            metadata: { boothId: booth.boothId } 
        });

        return res.status(201).json({ success: true, booth });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Booth creation failed' });
    }
};

const toggleBoothStatus = async (req, res) => {
    try {
        const booth = await Booth.findById(req.params.id);
        if (!booth) return res.status(404).json({ success: false, message: 'Booth not found' });

        booth.isActive = !booth.isActive;
        await booth.save();

        return res.status(200).json({ success: true, booth });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Toggle failed' });
    }
};

module.exports = { getBooths, createBooth, toggleBoothStatus };
