const mongoose = require('mongoose');

const ACTION_TYPES = [
    'LOGIN_ATTEMPT',
    'LOGIN_SUCCESS',
    'LOGIN_FAILED',
    'OTP_SENT',
    'OTP_VERIFIED',
    'OTP_FAILED',
    'OTP_EXPIRED',
    'VOTE_CAST',
    'VOTE_REJECTED',
    'LOGOUT',
    'ADMIN_LOGIN',
    'ADMIN_ADD_VOTER',
    'ADMIN_DELETE_VOTER',
    'ADMIN_ADD_CANDIDATE',
    'ADMIN_ADD_BOOTH',
    'ELECTION_OPENED',
    'ELECTION_CLOSED',
    'ACCOUNT_LOCKED',
];

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        enum: ACTION_TYPES,
        required: true,
    },
    actorId: {
        type: String,
        required: true, // voterId or adminId
    },
    actorRole: {
        type: String,
        enum: ['VOTER', 'ADMIN', 'SUPER_ADMIN', 'BOOTH_ADMIN'],
        default: 'VOTER',
    },
    boothId: {
        type: String,
        default: null,
    },
    candidateId: {
        type: String,
        default: null,
    },
    ipAddress: {
        type: String,
        default: null,
    },
    txHash: {
        type: String,
        default: null,
    },
    success: {
        type: Boolean,
        required: true,
    },
    errorMessage: {
        type: String,
        default: null,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    timestamp: {
        type: Date,
        default: Date.now,
        immutable: true, // Cannot be modified after creation
    },
});

// Indexes for fast audit queries
auditLogSchema.index({ actorId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ boothId: 1 });
auditLogSchema.index({ success: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);