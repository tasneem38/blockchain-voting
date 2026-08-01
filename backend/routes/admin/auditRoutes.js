const express = require('express');
const { getAuditLogs } = require('../../controllers/admin/auditAdminController');
const authMiddleware = require('../../middleware/authMiddleware');
const adminMiddleware = require('../../middleware/adminMiddleware');

const router = express.Router();

router.get('/', authMiddleware, adminMiddleware, getAuditLogs);

module.exports = router;
