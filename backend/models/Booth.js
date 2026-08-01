const mongoose = require('mongoose');

const boothSchema = new mongoose.Schema({
    boothId: {
        type: String,
        required: [true, 'Booth ID is required'],
        unique: true,
        uppercase: true,
        trim: true,
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    voterCount: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

boothSchema.index({ boothId: 1 });

module.exports = mongoose.model('Booth', boothSchema);