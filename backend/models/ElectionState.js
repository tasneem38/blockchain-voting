const mongoose = require('mongoose');

/**
 * Persists election open/closed state in MongoDB
 * so it survives server restarts.
 * There should only ever be ONE document (singleton).
 */
const electionStateSchema = new mongoose.Schema({
    isOpen: { type: Boolean, default: false },
    openedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('ElectionState', electionStateSchema);
