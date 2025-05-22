const express = require('express');
const walletController = require('../controllers/walletController');
const { verifyToken, requireAdmin } = require('../../../../libs/auth-middleware/auth-middleware');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// User wallet routes
router.get('/me', walletController.getWallet);
router.get('/balance', walletController.getBalance);
router.get('/transactions', walletController.getTransactions);
router.post('/deposit', walletController.deposit);
router.post('/withdraw', walletController.withdraw);
router.post('/lock-funds', walletController.lockFunds);
router.post('/unlock-funds', walletController.unlockFunds);

// Admin/Service routes
router.post('/process-winnings', requireAdmin, walletController.processWinnings);
router.post('/transfer', requireAdmin, walletController.transferFunds);

module.exports = router;