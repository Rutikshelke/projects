const router = require("express").Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swaggers/swagger');

// ✅ Main docs (combined or general)
// Serve General API Docs
// Serve General API Docs - No conflicts here
router.use(
    '/general',
    swaggerUi.serveFiles(swaggerDocument, {}),
    swaggerUi.setup(swaggerDocument)
);


module.exports = router;