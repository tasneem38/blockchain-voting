const express = require('express');
const { getCandidates, createCandidate, deleteCandidate } = require('../../controllers/admin/candidateAdminController');
const authMiddleware = require('../../middleware/authMiddleware');
const adminMiddleware = require('../../middleware/adminMiddleware');

const router = express.Router();

router.get('/', authMiddleware, adminMiddleware, getCandidates);
router.post('/', authMiddleware, adminMiddleware, createCandidate);
router.delete('/:id', authMiddleware, adminMiddleware, deleteCandidate);

module.exports = router;
