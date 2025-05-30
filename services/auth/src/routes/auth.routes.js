const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/verify-token', authController.verifyToken);

// Protected routes
router.use(authenticateToken);
router.post('/logout', authController.logout);
router.post('/logout-all', authController.logoutAll);
router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.put('/change-password', authController.changePassword);

module.exports = router;