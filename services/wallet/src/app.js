const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const redis = require('redis');
require('dotenv').config();

const walletRoutes = require('./routes/walletRoutes');
const { errorHandler } = require('../../../libs/error-handler/error-handler');
const { logger, requestLogger } = require('../../../libs/logging/logging');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3010'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/wallet', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => logger.info('Connected to MongoDB'))
    .catch(err => logger.error('MongoDB connection error:', err));

// Redis connection
const redisClient = redis.createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.connect().then(() => {
    logger.info('Connected to Redis');
}).catch(err => logger.error('Redis connection error:', err));

// Make redis client available to routes
app.locals.redisClient = redisClient;

// Routes
app.use('/api/wallet', walletRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        service: 'wallet-service',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    logger.info(`Wallet service running on port ${PORT}`);
});

module.exports = app;