const Joi = require('joi');
const Wallet = require('../models/Wallet.model');
const { logger } = require('../../../../libs/logging/logging');
const { ValidationError, NotFoundError, ConflictError, asyncHandler } = require('../../../../libs/error-handler/error-handler');

// Validation schemas
const depositSchema = Joi.object({
    amount: Joi.number().positive().max(10000).required(),
    paymentMethod: Joi.string().valid('credit_card', 'debit_card', 'bank_transfer', 'paypal').required(),
    paymentReference: Joi.string().required()
});

const withdrawalSchema = Joi.object({
    amount: Joi.number().positive().required(),
    withdrawalMethod: Joi.string().valid('bank_transfer', 'paypal').required(),
    accountDetails: Joi.object().required()
});

const lockFundsSchema = Joi.object({
    amount: Joi.number().positive().required(),
    reason: Joi.string().required(),
    reference: Joi.string().optional()
});

// Get wallet for user
exports.getWallet = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
        // Create wallet if it doesn't exist
        wallet = new Wallet({ userId });
        await wallet.save();
        logger.info(`Created new wallet for user: ${userId}`);
    }

    res.json({
        success: true,
        wallet: {
            id: wallet._id,
            balance: wallet.balance,
            lockedAmount: wallet.lockedAmount,
            availableBalance: wallet.availableBalance,
            totalDeposited: wallet.totalDeposited,
            totalWithdrawn: wallet.totalWithdrawn,
            totalWinnings: wallet.totalWinnings,
            currency: wallet.currency,
            isActive: wallet.isActive,
            lastTransactionAt: wallet.lastTransactionAt
        }
    });
});

// Get wallet balance
exports.getBalance = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
        throw new NotFoundError('Wallet not found');
    }

    res.json({
        success: true,
        balance: {
            total: wallet.balance,
            available: wallet.availableBalance,
            locked: wallet.lockedAmount
        }
    });
});

// Get transaction history
exports.getTransactions = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type;
    const status = req.query.status;

    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
        throw new NotFoundError('Wallet not found');
    }

    let transactions = wallet.transactions;

    // Filter by type if specified
    if (type) {
        transactions = transactions.filter(t => t.type === type);
    }

    // Filter by status if specified
    if (status) {
        transactions = transactions.filter(t => t.status === status);
    }

    // Sort by creation date (newest first)
    transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTransactions = transactions.slice(startIndex, endIndex);

    res.json({
        success: true,
        transactions: paginatedTransactions,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(transactions.length / limit),
            totalTransactions: transactions.length,
            hasNextPage: endIndex < transactions.length,
            hasPrevPage: page > 1
        }
    });
});

// Deposit funds
exports.deposit = asyncHandler(async (req, res) => {
    const { error, value } = depositSchema.validate(req.body);
    if (error) {
        throw new ValidationError(error.details[0].message);
    }

    const { amount, paymentMethod, paymentReference } = value;
    const userId = req.user.id;

    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
        wallet = new Wallet({ userId });
    }

    // In a real application, you would integrate with a payment processor here
    // For now, we'll simulate a successful payment
    const paymentSuccessful = await simulatePayment(paymentMethod, amount, paymentReference);

    if (!paymentSuccessful) {
        wallet.addTransaction({
            type: 'deposit',
            amount,
            description: `Failed deposit via ${paymentMethod}`,
            reference: paymentReference,
            status: 'failed'
        });
        await wallet.save();

        return res.status(400).json({
            success: false,
            message: 'Payment failed'
        });
    }

    wallet.credit(
        amount,
        'deposit',
        `Deposit via ${paymentMethod}`,
        paymentReference,
        { paymentMethod }
    );

    await wallet.save();

    logger.info(`Deposit successful for user ${userId}: ${amount}`);

    res.json({
        success: true,
        message: 'Deposit successful',
        transaction: wallet.transactions[wallet.transactions.length - 1],
        newBalance: wallet.balance
    });
});

// Withdraw funds
exports.withdraw = asyncHandler(async (req, res) => {
    const { error, value } = withdrawalSchema.validate(req.body);
    if (error) {
        throw new ValidationError(error.details[0].message);
    }

    const { amount, withdrawalMethod, accountDetails } = value;
    const userId = req.user.id;

    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
        throw new NotFoundError('Wallet not found');
    }

    if (wallet.availableBalance < amount) {
        throw new ConflictError('Insufficient balance');
    }

    // Add withdrawal transaction as pending
    wallet.addTransaction({
        type: 'withdrawal',
        amount: -amount,
        description: `Withdrawal via ${withdrawalMethod}`,
        reference: `WD-${Date.now()}`,
        status: 'pending',
        metadata: { withdrawalMethod, accountDetails }
    });

    // Lock the funds
    wallet.lockFunds(amount);

    await wallet.save();

    // In a real application, you would process the withdrawal here
    // For now, we'll simulate processing
    setTimeout(async () => {
        try {
            const updatedWallet = await Wallet.findOne({ userId });
            const transaction = updatedWallet.transactions.id(updatedWallet.transactions[updatedWallet.transactions.length - 1]._id);

            // Simulate withdrawal processing
            const withdrawalSuccessful = await simulateWithdrawal(withdrawalMethod, amount, accountDetails);

            if (withdrawalSuccessful) {
                updatedWallet.balance -= amount;
                updatedWallet.totalWithdrawn += amount;
                updatedWallet.unlockFunds(amount);
                transaction.status = 'completed';
            } else {
                updatedWallet.unlockFunds(amount);
                transaction.status = 'failed';
            }

            await updatedWallet.save();
            logger.info(`Withdrawal ${withdrawalSuccessful ? 'completed' : 'failed'} for user ${userId}: ${amount}`);
        } catch (error) {
            logger.error('Withdrawal processing error:', error);
        }
    }, 5000); // Simulate 5 second processing time

    res.json({
        success: true,
        message: 'Withdrawal request submitted',
        transaction: wallet.transactions[wallet.transactions.length - 1]
    });
});

// Lock funds (for contest entry)
exports.lockFunds = asyncHandler(async (req, res) => {
    const { error, value } = lockFundsSchema.validate(req.body);
    if (error) {
        throw new ValidationError(error.details[0].message);
    }

    const { amount, reason, reference } = value;
    const userId = req.user.id;

    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
        throw new NotFoundError('Wallet not found');
    }

    if (wallet.availableBalance < amount) {
        throw new ConflictError('Insufficient balance to lock funds');
    }

    wallet.lockFunds(amount);
    wallet.addTransaction({
        type: 'contest_entry',
        amount: -amount,
        description: reason,
        reference,
        status: 'completed',
        metadata: { action: 'lock' }
    });

    await wallet.save();

    logger.info(`Locked ${amount} for user ${userId}: ${reason}`);

    res.json({
        success: true,
        message: 'Funds locked successfully',
        lockedAmount: amount,
        availableBalance: wallet.availableBalance
    });
});

// Unlock funds
exports.unlockFunds = asyncHandler(async (req, res) => {
    const { amount, reason, reference } = req.body;
    const userId = req.user.id;

    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
        throw new NotFoundError('Wallet not found');
    }

    if (wallet.lockedAmount < amount) {
        throw new ConflictError('Cannot unlock more funds than currently locked');
    }

    wallet.unlockFunds(amount);
    wallet.addTransaction({
        type: 'refund',
        amount,
        description: reason || 'Funds unlocked',
        reference,
        status: 'completed',
        metadata: { action: 'unlock' }
    });

    await wallet.save();

    logger.info(`Unlocked ${amount} for user ${userId}: ${reason}`);

    res.json({
        success: true,
        message: 'Funds unlocked successfully',
        unlockedAmount: amount,
        availableBalance: wallet.availableBalance
    });
});

// Process contest winnings
exports.processWinnings = asyncHandler(async (req, res) => {
    const { amount, contestId, description } = req.body;
    const userId = req.user.id;

    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
        throw new NotFoundError('Wallet not found');
    }

    wallet.credit(
        amount,
        'contest_winnings',
        description || `Contest winnings - Contest ${contestId}`,
        contestId
    );

    await wallet.save();

    logger.info(`Processed winnings for user ${userId}: ${amount} from contest ${contestId}`);

    res.json({
        success: true,
        message: 'Winnings processed successfully',
        amount,
        newBalance: wallet.balance
    });
});

// Transfer funds between users (for contest settlements)
exports.transferFunds = asyncHandler(async (req, res) => {
    // This endpoint would typically be called by other services, not directly by users
    const { fromUserId, toUserId, amount, description, reference } = req.body;

    // Start a transaction session for atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const fromWallet = await Wallet.findOne({ userId: fromUserId }).session(session);
        let toWallet = await Wallet.findOne({ userId: toUserId }).session(session);

        if (!fromWallet) {
            throw new NotFoundError(`Source wallet not found for user ${fromUserId}`);
        }

        if (!toWallet) {
            toWallet = new Wallet({ userId: toUserId });
        }

        if (fromWallet.availableBalance < amount) {
            throw new ConflictError('Insufficient balance for transfer');
        }

        // Debit from source wallet
        fromWallet.debit(amount, 'transfer_out', description, reference);

        // Credit to destination wallet
        toWallet.credit(amount, 'transfer_in', description, reference);

        await fromWallet.save({ session });
        await toWallet.save({ session });

        await session.commitTransaction();

        logger.info(`Transferred ${amount} from user ${fromUserId} to user ${toUserId}`);

        res.json({
            success: true,
            message: 'Transfer completed successfully',
            amount,
            fromBalance: fromWallet.balance,
            toBalance: toWallet.balance
        });

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

// Helper functions to simulate payment processing
async function simulatePayment(paymentMethod, amount, reference) {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate 95% success rate
    return Math.random() > 0.05;
}

async function simulateWithdrawal(withdrawalMethod, amount, accountDetails) {
    // Simulate withdrawal processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate 90% success rate
    return Math.random() > 0.1;
}