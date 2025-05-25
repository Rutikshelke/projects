const redis = require('redis');
const { logger } = require('../../../../libs/logging/logging');
require("dotenv").config({ path: ".env" });

// Determine environment mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Use local Redis in development, and require REDIS_URL in production
const redisUrl = isDevelopment ? 'redis://localhost:6379' : process.env.REDIS_URL;

if (!redisUrl) {
    throw new Error('❌ REDIS_URL is required in production but not set.');
}

let redisClient;

const connectRedis = async () => {
    try {
        redisClient = redis.createClient({
            url: redisUrl,
            socket: {
                reconnectStrategy: (retries) => {
                    const delay = Math.min(retries * 100, 3000);
                    logger.warn(`🔁 Redis reconnect attempt #${retries}, retrying in ${delay}ms`);
                    return delay;
                },
            },
        });

        // Log error if Redis client emits one
        redisClient.on('error', (err) => {
            logger.error('❌ Redis Client Error:', err);
        });

        redisClient.on('connect', () => {
            logger.info('🔌 Redis client connecting...');
        });

        redisClient.on('ready', () => {
            logger.info('✅ Redis client connected and ready.');
        });

        redisClient.on('end', () => {
            logger.warn('⚠️ Redis connection closed.');
        });

        await redisClient.connect();
        return redisClient;

    } catch (err) {
        logger.error('❌ Redis connection error:', err);
        throw err;
    }
};

// Export connect and instance accessor
module.exports = {
    connectRedis,
    getClient: () => redisClient,
};

