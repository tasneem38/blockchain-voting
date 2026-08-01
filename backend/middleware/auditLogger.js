const AuditLog = require('../models/AuditLog');

/**
 * Logs an action to the AuditLog collection
 */
const logAction = async (action, actorId, actorRole, options = {}) => {
    try {
        await AuditLog.create({
            action,
            actorId,
            actorRole,
            boothId: options.boothId || null,
            candidateId: options.candidateId || null,
            ipAddress: options.ipAddress || null,
            txHash: options.txHash || null,
            success: options.success !== undefined ? options.success : true,
            errorMessage: options.errorMessage || null,
            metadata: options.metadata || {},
        });
    } catch (err) {
        console.error('Audit log failure:', err.message);
    }
};

/**
 * Middleware factory for automatic audit logging
 */
const auditMiddleware = (action) => {
    return async (req, res, next) => {
        // We log after the response is sent to know the outcome
        const originalSend = res.send;
        res.send = function (body) {
            res.send = originalSend;
            const success = res.statusCode >= 200 && res.statusCode < 300;
            
            // Async log
            logAction(action, req.user?.voterId || req.user?.adminId || 'ANONYMOUS', req.user?.role || 'VOTER', {
                ipAddress: req.ip,
                success,
                errorMessage: !success ? (typeof body === 'string' ? body : JSON.stringify(body)) : null
            });

            return res.send(body);
        };
        next();
    };
};

module.exports = { logAction, auditMiddleware };
