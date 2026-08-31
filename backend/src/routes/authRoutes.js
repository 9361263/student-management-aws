const express = require('express');
const router = express.Router();
const { login, register, getMe, listUsers } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.post('/login', login);
router.post('/register', verifyToken, requireAdmin, register);
router.get('/me', verifyToken, getMe);
router.get('/users', verifyToken, requireAdmin, listUsers);

module.exports = router;
