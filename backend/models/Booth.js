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
    state: {
        type: String,
        default: 'Karnataka',
        trim: true,
    },
    district: {
        type: String,
        default: 'Bengaluru Urban',
        trim: true,
    },
    constituency: {
        type: String,
        default: 'BTM Layout',
        trim: true,
    },
    wardNumber: {
        type: String,
        default: 'Ward 172',
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

module.exports = mongoose.model('Booth', boothSchema);