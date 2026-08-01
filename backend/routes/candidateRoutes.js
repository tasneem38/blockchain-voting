const express = require('express');
const { getCandidates } = require('../controllers/candidateController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getCandidates);

module.exports = router;
