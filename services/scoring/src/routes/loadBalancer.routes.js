const express = require('express');
const router = express.Router();
const { handleRequest } = require('../controllers/loadBalancer.controller');

router.get('/', handleRequest);

module.exports = router;
