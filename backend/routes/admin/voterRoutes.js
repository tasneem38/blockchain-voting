const express = require('express');
const { body } = require('express-validator');
const { getVoters, createVoter, deleteVoter, resetVoter } = require('../../controllers/admin/voterAdminController');
const authMiddleware = require('../../middleware/authMiddleware');
const adminMiddleware = require('../../middleware/adminMiddleware');

const router = express.Router();

router.get('/', authMiddleware, adminMiddleware, getVoters);

router.post('/', 
    authMiddleware, 
    adminMiddleware,
    [
        body('voterId').notEmpty(),
        body('email').isEmail(),
        body('password').isLength({ min: 6 }),
        body('boothId').notEmpty()
    ],
    createVoter
);

router.delete('/:id', authMiddleware, adminMiddleware, deleteVoter);

router.patch('/:id/reset', authMiddleware, adminMiddleware, resetVoter);

module.exports = router;
