const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const redis = require('redis');
const cron = require('node-cron');
require('dotenv').config();

const contestRoutes = require('./routes/contestRoutes');
const { errorHandler } = require('../../libs/error-handler');
const { logger, requestLogger } = require('../../libs/logging');
const { updateContestStatuses } = require('./services/contestService');

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
app.use('/api/contest', limiter);

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

app.locals.redisClient = redisClient;

// Routes
app.use('/api/contest', contestRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        service: 'contest-service',
        timestamp: new Date().toISOString()
    });
});

// Cron jobs
// Update contest statuses every minute
cron.schedule('* * * * *', () => {
    updateContestStatuses().catch(err =>
        logger.error('Error updating contest statuses:', err)
    );
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
    logger.info(`Contest service running on port ${PORT}`);
});

module.exports = app;