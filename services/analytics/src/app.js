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

const { errorHandler } = require('../../../libs/error-handler/error-handler');

// Importing and using various
const swaggerRouter = require("./routes/swagger.routes");


// Security middleware
app.use(helmet());

// Enable CORS for all origins in development mode Configure CORS middleware to allow access from all origins
const isDevelopment = process.env.NODE_ENV !== "production";

// ✅ Allowed Origins
const allowedOrigins = isDevelopment
    ? ["http://localhost:5173", "http://localhost:3000"]
    : process.env.ACCESS_CONTROL_ALLOW_ORIGIN
        ? process.env.ACCESS_CONTROL_ALLOW_ORIGIN.split(",").map(origin => origin.trim())
        : [];


// ✅ CORS Configuration
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, origin); // ✅ Set the specific origin
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Cookie", "Authorization"],
    credentials: true, // ✅ Allows cookies to be sent
};


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
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

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

// Serve the Swagger UI using the generated documentation
app.use('/docs', swaggerRouter);

// Define routes with tags


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