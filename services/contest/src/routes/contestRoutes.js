const express = require('express');
const contestController = require('../controllers/contestController');
const { verifyToken, requireAdmin } = require('../../../libs/auth-middleware');

const router = express.Router();

// Public routes
router.get('/', contestController.getContests);
router.get('/:id', contestController.getContest);
router.get('/:contestId/leaderboard', contestController.getLeaderboard);

// Protected routes
router.use(verifyToken);

// User routes
router.post('/join', contestController.joinContest);
router.get('/my/contests', contestController.getUserContests);
router.get('/:contestId/portfolio', contestController.getPortfolio);
router.post('/:contestId/buy', contestController.buyStock);
router.post('/:contestId/sell', contestController.sellStock);

// Admin routes
router.post('/', requireAdmin, contestController.createContest);

module.exports = router;