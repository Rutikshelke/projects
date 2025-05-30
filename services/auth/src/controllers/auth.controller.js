const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User.Model');
const { logger } = require('../../../../libs/logging/logging');

// Validation schemas
const registerSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().min(1).max(50).required(),
    lastName: Joi.string().min(1).max(50).required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

// Generate JWT tokens
const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { userId, type: 'access' },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { userId, type: 'refresh' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
};

// Register new user
exports.register = async (req, res) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }
        const { username, email, password, firstName, lastName } = value;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: email },
                { username: username }
            ]
        });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User already exists with this email or username'
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            firstName,
            lastName
        });

        await user.save();

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id);

        // Save refresh token to user
        user.refreshTokens.push({ token: refreshToken });
        await user.save();

        logger.info(`New user registered: ${email}`);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            },
            tokens: {
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { email, password } = value;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if account is locked
        if (user.isLocked()) {
            return res.status(423).json({
                success: false,
                message: 'Account temporarily locked due to too many failed login attempts'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Verify password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            await user.incLoginAttempts();
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Reset login attempts on successful login
        if (user.loginAttempts && user.loginAttempts > 0) {
            await user.resetLoginAttempts();
        }

        // Update last login
        user.lastLogin = new Date();

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id);

        // Save refresh token
        user.refreshTokens.push({ token: refreshToken });
        await user.save();

        logger.info(`User logged in: ${email}`);

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                avatar: user.avatar
            },
            tokens: {
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Refresh token
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token required'
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

        if (decoded.type !== 'refresh') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token type'
            });
        }

        // Find user and check if refresh token exists
        const user = await User.findById(decoded.userId);
        if (!user || !user.refreshTokens.some(token => token.token === refreshToken)) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

        // Remove old refresh token and add new one
        user.refreshTokens = user.refreshTokens.filter(token => token.token !== refreshToken);
        user.refreshTokens.push({ token: newRefreshToken });
        await user.save();

        res.json({
            success: true,
            tokens: {
                accessToken,
                refreshToken: newRefreshToken
            }
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token'
            });
        }

        logger.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Logout user
exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const userId = req.user.userId;

        if (refreshToken) {
            // Remove specific refresh token
            await User.findByIdAndUpdate(userId, {
                $pull: { refreshTokens: { token: refreshToken } }
            });
        }

        // Add access token to blacklist in Redis
        const redisClient = req.app.locals.redisClient;
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            const decoded = jwt.decode(token);
            const expiry = decoded.exp - Math.floor(Date.now() / 1000);
            if (expiry > 0) {
                await redisClient.setEx(`blacklist:${token}`, expiry, 'true');
            }
        }

        logger.info(`User logged out: ${userId}`);

        res.json({
            success: true,
            message: 'Logout successful'
        });

    } catch (error) {
        logger.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Logout from all devices
exports.logoutAll = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Remove all refresh tokens
        await User.findByIdAndUpdate(userId, {
            $set: { refreshTokens: [] }
        });

        logger.info(`User logged out from all devices: ${userId}`);

        res.json({
            success: true,
            message: 'Logged out from all devices'
        });

    } catch (error) {
        logger.error('Logout all error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password -refreshTokens');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: user
        });

    } catch (error) {
        logger.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const updateSchema = Joi.object({
            firstName: Joi.string().min(1).max(50),
            lastName: Joi.string().min(1).max(50),
            avatar: Joi.string().uri().allow(null)
        });

        const { error, value } = updateSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: value },
            { new: true, select: '-password -refreshTokens' }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        logger.info(`User profile updated: ${user.email}`);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: user
        });

    } catch (error) {
        logger.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const changePasswordSchema = Joi.object({
            currentPassword: Joi.string().required(),
            newPassword: Joi.string().min(6).required()
        });

        const { error, value } = changePasswordSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { currentPassword, newPassword } = value;

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isValidPassword = await user.comparePassword(currentPassword);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        user.refreshTokens = []; // Invalidate all refresh tokens
        await user.save();

        logger.info(`Password changed for user: ${user.email}`);

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        logger.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Verify token (for other services)
exports.verifyToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        // Check if token is blacklisted
        const redisClient = req.app.locals.redisClient;
        const isBlacklisted = await redisClient.get(`blacklist:${token}`);
        if (isBlacklisted) {
            return res.status(401).json({
                success: false,
                message: 'Token is invalid'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.type !== 'access') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token type'
            });
        }

        // Check if user exists and is active
        const user = await User.findById(decoded.userId).select('-password -refreshTokens');
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }

        res.json({
            success: true,
            user: user
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        logger.error('Verify token error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};