const express = require('express');
const { getElectionStatus, openElection, closeElection } = require('../../controllers/admin/electionAdminController');
const authMiddleware = require('../../middleware/authMiddleware');
const adminMiddleware = require('../../middleware/adminMiddleware');

const router = express.Router();

router.get('/status', authMiddleware, adminMiddleware, getElectionStatus);
router.post('/open', authMiddleware, adminMiddleware, openElection);
router.post('/close', authMiddleware, adminMiddleware, closeElection);

module.exports = router;
