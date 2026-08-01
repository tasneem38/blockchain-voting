const express = require('express');
const { castVote, getVoteStatus } = require('../controllers/voteController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, castVote);
router.get('/status', authMiddleware, getVoteStatus);

module.exports = router;
