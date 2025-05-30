const express = require("express");

const app = express();

const cors = require("cors");

const path = require("path");

const morgan = require("morgan");

const cookieParser = require("cookie-parser");

const helmet = require('helmet');

const { connectRedis, getClient } = require("./configs/redis");

require("dotenv").config({ path: ".env" });


const { errorHandler } = require('../../../libs/error-handler/error-handler');
const { logger, requestLogger } = require('../../../libs/logging/logging');
const rateLimiter = require('./middleware/rateLimiter');
const corsOptions = require('./configs/cors'); // ✅ Import your config

// Importing and using various
const loadBalancerRoutes = require('./routes/loadBalancer.routes');
const swaggerRouter = require("./routes/swagger.routes");


// Security middleware
app.use(helmet());

app.use(cors(corsOptions));

// Load Balancer
app.use(loadBalancerRoutes);

// Rate limiting
app.use('/api/leaderboard', rateLimiter);

// Middleware for parsing URL-encoded and JSON request bodies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Middleware for parsing cookies
app.use(cookieParser());

// HTTP request logger middleware (Morgan) with "tiny" format
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Serve static files from the "media" directory
app.use("/media", express.static(path.join(__dirname, "storage", "upload")));


// ✅ Connect to Redis
(async () => {
    try {
        const redisClient = await connectRedis();
        app.locals.redisClient = redisClient;
        logger.info("✅ Redis connected and client attached to app.locals");
    } catch (err) {
        logger.error("❌ Failed to connect to Redis:", err);
        process.exit(1); // Fail fast
    }
})();

// Make redis client available to routes
app.locals.redisClient = getClient;

// Serve the Swagger UI using the generated documentation
app.use('/api/docs', swaggerRouter);

// Define routes with tags


// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        service: 'leaderboard-service',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;