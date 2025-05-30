const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const os = require('os');

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

// Create logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        timestamp(),
        errors({ stack: true }),
        json()
    ),
    defaultMeta: {
        service: process.env.SERVICE_NAME || 'unknown-service',
        environment: process.env.NODE_ENV || 'development',
        hostname: os.hostname()
    },
    transports: [
        new winston.transports.Console({
            format: combine(
                colorize(),
                simple(),
                winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
                    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
                    return `${timestamp} [${service}] ${level}: ${message} ${metaStr}`;
                })
            )
        }),

        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5 * 1024 * 1024, // 5MB
            maxFiles: 5
        }),

        new DailyRotateFile({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'
        })
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: 'logs/exceptions.log' })
    ],
    rejectionHandlers: [
        new winston.transports.File({ filename: 'logs/rejections.log' })
    ]
});

// Create request logger middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;

        const logData = {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress,
            userId: req.user?.userId || null,
            headers: req.headers,
            query: req.query,
            body: req.method !== 'GET' && req.body ? req.body : undefined // Avoid logging sensitive GET requests
        };

        const level = res.statusCode >= 500
            ? 'error'
            : res.statusCode >= 400
                ? 'warn'
                : 'info';

        logger.log(level, 'HTTP Request', logData);
    });

    next();
};

module.exports = {
    logger,
    requestLogger
};
