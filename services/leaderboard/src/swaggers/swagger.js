const swaggerDoc = require('swagger-jsdoc');
require("dotenv").config({ path: ".env" });

const isDevelopment = process.env.NODE_ENV === 'development';

const allowedOrigins = isDevelopment
    ? ["http://localhost:5173", "http://localhost:3000"]
    : process.env.ACCESS_CONTROL_ALLOW_ORIGIN
        ? process.env.ACCESS_CONTROL_ALLOW_ORIGIN.split(",").map(origin => origin.trim())
        : [];

// Pick the first origin for Swagger UI (Swagger UI `servers` only takes one base URL)
const serverUrl = allowedOrigins[0] || 'http://localhost:8000';

const options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Leaderboard API Documentation',
            version: '1.0.0',
            description: 'Documentation for your APIs',
        },
        servers: [
            {
                url: serverUrl,
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    name: 'session-token',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    in: 'header',
                },
            },
        },
    },
    apis: ['./src/routes/*.js']
};

const swaggerDocument = swaggerDoc(options);

module.exports = swaggerDocument;