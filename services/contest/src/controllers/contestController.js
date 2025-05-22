const Joi = require('joi');
const axios = require('axios');
const Contest = require('../models/Contest');
const Portfolio = require('../models/Portfolio');
const { logger } = require('../../../../libs/logging/logging');
const { ValidationError, NotFoundError, ConflictError, asyncHandler } = require('../../../../libs/error-handler/error-handler');

// Validation schemas
const createContestSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(500).required(),
  type: Joi.string().valid('daily', 'weekly', 'monthly', 'custom').required(),
  entryFee: Joi.number().min(0).max(1000).required(),
  maxParticipants: Joi.number().min(2).max(10000).required(),
  minParticipants: Joi.number().min(2).required(),
  startTime: Joi.date().greater('now').required(),
  endTime: Joi.date().greater(Joi.ref('startTime')).required(),
  registrationDeadline: Joi.date().less(Joi.ref('startTime')).required(),
  prizeDistribution: Joi.array().items(
    Joi.object({
      position: Joi.number().min(1).required(),
      percentage: Joi.number().min(0).max(100).required()
    })
  ).required(),
  rules: Joi.object({
    maxPositionsPerStock: Joi.number().min(1).max(10).default(1),
    allowedSectors: Joi.array().items(Joi.string()),
    blockedStocks: Joi.array().items(Joi.string()),
    maxPortfolioValue: Joi.number().min(1000).default(100000),
    minPortfolioValue: Joi.number().min(100).default(1000)
  }),
  featured: Joi.boolean().default(false),
  tags: Joi.array().items(Joi.string())
});

const joinContestSchema = Joi.object({
  contestId: Joi.string().required()
});

const buyStockSchema = Joi.object({
  symbol: Joi.string().required(),
  quantity: Joi.number().min(1).required()
});

const sellStockSchema = Joi.object({
  symbol: Joi.string().required(),
  quantity: Joi.number().min(1).required()
});

// Get all contests with filters
exports.getContests = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const status = req.query.status;
  const type = req.query.type;
  const featured = req.query.featured;
  const minEntryFee = req.query.minEntryFee;
  const maxEntryFee = req.query.maxEntryFee;

  // Build filter query
  const filter = { isActive: true };

  if (status) filter.status = status;
  if (type) filter.type = type;
  if (featured !== undefined) filter.featured = featured === 'true';
  if (minEntryFee) filter.entryFee = { ...filter.entryFee, $gte: parseInt(minEntryFee) };
  if (maxEntryFee) filter.entryFee = { ...filter.entryFee, $lte: parseInt(maxEntryFee) };

  const skip = (page - 1) * limit;

  const contests = await Contest.find(filter)
    .sort({ featured: -1, startTime: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Contest.countDocuments(filter);

  res.json({
    success: true,
    contests,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalContests: total,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    }
  });
});

// Get single contest by ID
exports.getContest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const contest = await Contest.findById(id);

  if (!contest) {
    throw new NotFoundError('Contest not found');
  }

  res.json({
    success: true,
    contest
  });
});

// Create new contest (admin only)
exports.createContest = asyncHandler(async (req, res) => {
  const { error, value } = createContestSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

  // Validate prize distribution percentages sum to 100
  const totalPercentage = value.prizeDistribution.reduce((sum, prize) => sum + prize.percentage, 0);
  if (totalPercentage !== 100) {
    throw new ValidationError('Prize distribution percentages must sum to 100%');
  }

  // Validate min participants is less than max participants
  if (value.minParticipants >= value.maxParticipants) {
    throw new ValidationError('Minimum participants must be less than maximum participants');
  }

  const contest = new Contest({
    ...value,
    createdBy: req.user.id,
    status: 'open'
  });

  // Calculate prize amounts (will be updated when contest fills)
  contest.prizeDistribution.forEach(prize => {
    prize.amount = 0; // Will be calculated based on actual prize pool
  });

  await contest.save();

  logger.info(`Contest created: ${contest.name} by user ${req.user.id}`);

  res.status(201).json({
    success: true,
    message: 'Contest created successfully',
    contest
  });
});

// Join contest
exports.joinContest = asyncHandler(async (req, res) => {
  const { error, value } = joinContestSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

  const { contestId } = value;
  const userId = req.user.id;

  const contest = await Contest.findById(contestId);

  if (!contest) {
    throw new NotFoundError('Contest not found');
  }

  // Check if contest is joinable
  if (!contest.registrationOpen) {
    throw new ConflictError('Contest registration is closed');
  }

  // Check if user already joined
  const existingPortfolio = await Portfolio.findOne({ userId, contestId });
  if (existingPortfolio) {
    throw new ConflictError('You have already joined this contest');
  }

  // Lock entry fee from user's wallet
  if (contest.entryFee > 0) {
    try {
      await axios.post(`${process.env.WALLET_SERVICE_URL}/api/wallet/lock-funds`, {
        amount: contest.entryFee,
        reason: `Contest entry: ${contest.name}`,
        reference: contestId
      }, {
        headers: {
          'Authorization': req.headers.authorization
        }
      });
    } catch (error) {
      if (error.response?.status === 409) {
        throw new ConflictError('Insufficient balance to join contest');
      }
      throw new Error('Failed to process entry fee');
    }
  }

  // Create portfolio for user
  const portfolio = new Portfolio({
    userId,
    contestId,
    totalValue: contest.rules.maxPortfolioValue,
    currentValue: contest.rules.maxPortfolioValue,
    cashBalance: contest.rules.maxPortfolioValue
  });

  await portfolio.save();

  // Update contest participant count and prize pool
  contest.currentParticipants += 1;
  contest.prizePool += contest.entryFee;

  // Update prize amounts based on new prize pool
  contest.prizeDistribution.forEach(prize => {
    prize.amount = (prize.percentage / 100) * contest.prizePool;
  });

  await contest.save();

  logger.info(`User ${userId} joined contest ${contestId}`);

  res.json({
    success: true,
    message: 'Successfully joined contest',
    portfolio
  });
});

// Get user's portfolio for a contest
exports.getPortfolio = asyncHandler(async (req, res) => {
  const { contestId } = req.params;
  const userId = req.user.id;

  const portfolio = await Portfolio.findOne({ userId, contestId }).populate('contestId', 'name status');

  if (!portfolio) {
    throw new NotFoundError('Portfolio not found for this contest');
  }

  res.json({
    success: true,
    portfolio
  });
});

// Buy stock in contest
exports.buyStock = asyncHandler(async (req, res) => {
  const { contestId } = req.params;
  const { error, value } = buyStockSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

  const { symbol, quantity } = value;
  const userId = req.user.id;

  const portfolio = await Portfolio.findOne({ userId, contestId });
  if (!portfolio) {
    throw new NotFoundError('Portfolio not found');
  }

  const contest = await Contest.findById(contestId);
  if (contest.status !== 'active') {
    throw new ConflictError('Contest is not active');
  }

  // Get current stock price (mock API call)
  const stockData = await getStockPrice(symbol);
  const totalCost = quantity * stockData.price;

  // Check if user has enough cash
  if (portfolio.cashBalance < totalCost) {
    throw new ConflictError('Insufficient cash balance');
  }

  // Check contest rules
  const existingPosition = portfolio.positions.find(p => p.symbol === symbol);
  const totalQuantity = existingPosition ? existingPosition.quantity + quantity : quantity;

  if (totalQuantity > contest.rules.maxPositionsPerStock) {
    throw new ConflictError(`Maximum ${contest.rules.maxPositionsPerStock} positions allowed per stock`);
  }

  if (contest.rules.blockedStocks.includes(symbol)) {
    throw new ConflictError('This stock is not allowed in this contest');
  }

  if (contest.rules.allowedSectors.length > 0 && !contest.rules.allowedSectors.includes(stockData.sector)) {
    throw new ConflictError('This sector is not allowed in this contest');
  }

  // Add position
  portfolio.addPosition({
    symbol,
    companyName: stockData.companyName,
    quantity,
    entryPrice: stockData.price,
    currentPrice: stockData.price,
    sector: stockData.sector
  });

  await portfolio.save();

  logger.info(`User ${userId} bought ${quantity} shares of ${symbol} in contest ${contestId}`);

  res.json({
    success: true,
    message: 'Stock purchased successfully',
    portfolio
  });
});

// Sell stock in contest
exports.sellStock = asyncHandler(async (req, res) => {
  const { contestId } = req.params;
  const { error, value } = sellStockSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

  const { symbol, quantity } = value;
  const userId = req.user.id;

  const portfolio = await Portfolio.findOne({ userId, contestId });
  if (!portfolio) {
    throw new NotFoundError('Portfolio not found');
  }

  const contest = await Contest.findById(contestId);
  if (contest.status !== 'active') {
    throw new ConflictError('Contest is not active');
  }

  // Get current stock price
  const stockData = await getStockPrice(symbol);

  // Update current price in portfolio
  const position = portfolio.positions.find(p => p.symbol === symbol);
  if (position) {
    position.currentPrice = stockData.price;
  }

  // Sell position
  portfolio.removePosition(symbol, quantity);

  await portfolio.save();

  logger.info(`User ${userId} sold ${quantity} shares of ${symbol} in contest ${contestId}`);

  res.json({
    success: true,
    message: 'Stock sold successfully',
    portfolio
  });
});

// Get contest leaderboard
exports.getLeaderboard = asyncHandler(async (req, res) => {
  const { contestId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;

  const contest = await Contest.findById(contestId);
  if (!contest) {
    throw new NotFoundError('Contest not found');
  }

  const skip = (page - 1) * limit;

  const portfolios = await Portfolio.find({ contestId })
    .sort({ totalPnLPercentage: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'username firstName lastName avatar')
    .lean();

  // Add rank to each portfolio
  portfolios.forEach((portfolio, index) => {
    portfolio.rank = skip + index + 1;
  });

  const total = await Portfolio.countDocuments({ contestId });

  res.json({
    success: true,
    leaderboard: portfolios,
    contest: {
      name: contest.name,
      status: contest.status,
      prizePool: contest.prizePool,
      prizeDistribution: contest.prizeDistribution
    },
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalParticipants: total,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    }
  });
});

// Get user's contest history
exports.getUserContests = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const status = req.query.status;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  // Build aggregation pipeline
  const pipeline = [
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'contests',
        localField: 'contestId',
        foreignField: '_id',
        as: 'contest'
      }
    },
    { $unwind: '$contest' }
  ];

  if (status) {
    pipeline.push({ $match: { 'contest.status': status } });
  }

  pipeline.push(
    { $sort: { 'contest.startTime': -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit }
  );

  const userContests = await Portfolio.aggregate(pipeline);

  res.json({
    success: true,
    contests: userContests
  });
});

// Mock function to get stock price
async function getStockPrice(symbol) {
  // In a real application, this would call a stock price API
  // For demo purposes, we'll return mock data
  const mockStocks = {
    'AAPL': { price: 150.25, companyName: 'Apple Inc.', sector: 'Technology' },
    'GOOGL': { price: 2800.50, companyName: 'Alphabet Inc.', sector: 'Technology' },
    'MSFT': { price: 310.75, companyName: 'Microsoft Corporation', sector: 'Technology' },
    'AMZN': { price: 3200.00, companyName: 'Amazon.com Inc.', sector: 'Consumer Discretionary' },
    'TSLA': { price: 800.25, companyName: 'Tesla Inc.', sector: 'Consumer Discretionary' }
  };

  if (!mockStocks[symbol]) {
    throw new NotFoundError(`Stock ${symbol} not found`);
  }

  // Add some random price fluctuation (±2%)
  const basePrice = mockStocks[symbol].price;
  const fluctuation = (Math.random() - 0.5) * 0.04; // ±2%
  const currentPrice = basePrice * (1 + fluctuation);

  return {
    ...mockStocks[symbol],
    price: Math.round(currentPrice * 100) / 100
  };
}