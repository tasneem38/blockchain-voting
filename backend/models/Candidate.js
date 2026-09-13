const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    candidateId: {
        type: String,
        required: [true, 'Candidate ID is required'],
        unique: true,
        uppercase: true,
        trim: true,
    },
    name: {
        type: String,
        required: [true, 'Candidate name is required'],
        trim: true,
    },
    party: {
        type: String,
        required: [true, 'Party name is required'],
        trim: true,
    },
    symbol: {
        type: String,
        default: null, // URL to party symbol image
    },
    constituency: {
        type: String,
        default: 'BTM Layout',
        trim: true,
    },
    electionType: {
        type: String,
        default: 'Karnataka State Assembly',
        trim: true,
    },
    boothId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booth',
        required: [true, 'Booth assignment is required'],
    },
}, { timestamps: true });

candidateSchema.index({ boothId: 1 });

module.exports = mongoose.model('Candidate', candidateSchema);