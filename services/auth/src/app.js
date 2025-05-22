const express = require("express");

const app = express();

const cors = require("cors");

const path = require("path");

const morgan = require("morgan");

const cookieParser = require("cookie-parser");

const helmet = require('helmet');

const rateLimit = require('express-rate-limit');

const redis = require('redis');

require("dotenv").config({ path: ".env" });

// Importing and using various 
const authRoutes = require('./routes/authRoutes');
const { errorHandler } = require('../../../libs/error-handler/error-handler');

// Security middleware
app.use(helmet());

// Configure CORS middleware to allow access from all origins
if (process.env.NODE_ENV !== "development") {
    app.use(
        cors({
            exposedHeaders: ["Cookie", "Authorization"], // Expose specific headers
            credentials: true, // Allow credentials (e.g., cookies)
            origin: process.env.ACCESS_CONTROL_ALLOW_ORIGIN, // Allow access from all origins
        })
    );
}

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/auth', limiter);

// Middleware for parsing URL-encoded and JSON request bodies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Middleware for parsing cookies
app.use(cookieParser());

// HTTP request logger middleware (Morgan) with "tiny" format
app.use(morgan("tiny"));

// Serve static files from the "media" directory
app.use("/media", express.static(path.join(__dirname, "storage", "upload")));

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

// Define routes with tags
app.use('/api/auth', authRoutes);


// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        service: 'auth-service',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use(errorHandler);
module.exports = app;