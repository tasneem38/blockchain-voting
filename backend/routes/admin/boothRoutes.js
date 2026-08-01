const express = require('express');
const { getBooths, createBooth, toggleBoothStatus } = require('../../controllers/admin/boothAdminController');
const authMiddleware = require('../../middleware/authMiddleware');
const adminMiddleware = require('../../middleware/adminMiddleware');

const router = express.Router();

router.get('/', authMiddleware, adminMiddleware, getBooths);
router.post('/', authMiddleware, adminMiddleware, createBooth);
router.patch('/:id/toggle', authMiddleware, adminMiddleware, toggleBoothStatus);

module.exports = router;
