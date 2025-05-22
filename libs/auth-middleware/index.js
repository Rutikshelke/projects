const axios = require('axios');
const { logger } = require('@fantasy-stock/logging');
const { AuthenticationError, AuthorizationError } = require('@fantasy-stock/error-handler');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';

// Middleware to verify JWT token with auth service
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            throw new AuthenticationError('Access token required');
        }

        // Verify token with auth service
        const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/verify-token`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            timeout: 5000
        });

        if (response.data.success) {
            req.user = response.data.user;
            next();
        } else {
            throw new AuthenticationError('Invalid token');
        }

    } catch (error) {
        if (error.response?.status === 401) {
            throw new AuthenticationError('Invalid or expired token');
        }

        if (error.code === 'ECONNREFUSED' || error.code === 'TIMEOUT') {
            logger.error('Auth service unavailable', { error: error.message });
            return res.status(503).json({
                success: false,
                message: 'Authentication service unavailable'
            });
        }

        logger.error('Token verification error', { error: error.message });
        throw new AuthenticationError('Authentication failed');
    }
};

// Middleware to check user roles
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new AuthenticationError('Authentication required');
        }

        if (!roles.includes(req.user.role)) {
            throw new AuthorizationError('Insufficient permissions');
        }

        next();
    };
};

// Middleware to check if user is admin
const requireAdmin = requireRole(['admin']);

// Middleware to check if user owns the resource
const requireOwnership = (userIdField = 'userId') => {
    return (req, res, next) => {
        if (!req.user) {
            throw new AuthenticationError('Authentication required');
        }

        const resourceUserId = req.params[userIdField] || req.body[userIdField];

        if (req.user.role === 'admin' || req.user.id === resourceUserId) {
            next();
        } else {
            throw new AuthorizationError('Access denied');
        }
    };
};

module.exports = {
    verifyToken,
    requireRole,
    requireAdmin,
    requireOwnership
};