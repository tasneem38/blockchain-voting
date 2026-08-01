const express = require('express');
const { getResults } = require('../controllers/resultController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/', authMiddleware, adminMiddleware, getResults);

module.exports = router;
