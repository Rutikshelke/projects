const router = require("express").Router();
const swaggerUi = require('swagger-ui-express');
const { swaggerDocument, swaggerUIOptions } = require('../swaggers/swagger');

// ✅ Serve Swagger UI static files
router.use('/', swaggerUi.serve);

// ✅ Setup Swagger UI with custom options
router.get('/', swaggerUi.setup(swaggerDocument, {}));

// ✅ Optional: Serve raw JSON documentation
router.get('/json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
});

// ✅ Optional: Health check for docs
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Swagger documentation is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;