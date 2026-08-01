const express = require('express');
const { getOverview } = require('../../controllers/admin/overviewAdminController');
const authMiddleware = require('../../middleware/authMiddleware');
const adminMiddleware = require('../../middleware/adminMiddleware');

const router = express.Router();

router.get('/', authMiddleware, adminMiddleware, getOverview);

module.exports = router;
