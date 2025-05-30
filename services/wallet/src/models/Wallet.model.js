const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['deposit', 'withdrawal', 'contest_entry', 'contest_winnings', 'refund'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    reference: {
        type: String, // Could be contest ID, payment ID, etc.
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true,
        index: true
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    lockedAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    availableBalance: {
        type: Number,
        default: 0,
        min: 0
    },
    totalDeposited: {
        type: Number,
        default: 0,
        min: 0
    },
    totalWithdrawn: {
        type: Number,
        default: 0,
        min: 0
    },
    totalWinnings: {
        type: Number,
        default: 0,
        min: 0
    },
    currency: {
        type: String,
        default: 'USD',
        enum: ['USD', 'EUR', 'GBP', 'INR']
    },
    transactions: [transactionSchema],
    isActive: {
        type: Boolean,
        default: true
    },
    lastTransactionAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Calculate available balance before saving
walletSchema.pre('save', function (next) {
    this.availableBalance = this.balance - this.lockedAmount;
    next();
});

// Index for performance
walletSchema.index({ userId: 1 });
walletSchema.index({ 'transactions.createdAt': -1 });
walletSchema.index({ 'transactions.type': 1 });

// Instance methods
walletSchema.methods.addTransaction = function (transactionData) {
    this.transactions.push(transactionData);
    this.lastTransactionAt = new Date();
    return this;
};

walletSchema.methods.lockFunds = function (amount) {
    if (this.availableBalance < amount) {
        throw new Error('Insufficient balance to lock funds');
    }
    this.lockedAmount += amount;
    return this;
};

walletSchema.methods.unlockFunds = function (amount) {
    if (this.lockedAmount < amount) {
        throw new Error('Cannot unlock more funds than currently locked');
    }
    this.lockedAmount -= amount;
    return this;
};

walletSchema.methods.credit = function (amount, type, description, reference = null, metadata = {}) {
    this.balance += amount;

    if (type === 'deposit') {
        this.totalDeposited += amount;
    } else if (type === 'contest_winnings') {
        this.totalWinnings += amount;
    }

    this.addTransaction({
        type,
        amount,
        description,
        reference,
        status: 'completed',
        metadata
    });

    return this;
};

walletSchema.methods.debit = function (amount, type, description, reference = null, metadata = {}) {
    if (this.availableBalance < amount) {
        throw new Error('Insufficient balance');
    }

    this.balance -= amount;

    if (type === 'withdrawal') {
        this.totalWithdrawn += amount;
    }

    this.addTransaction({
        type,
        amount: -amount,
        description,
        reference,
        status: 'completed',
        metadata
    });

    return this;
};

module.exports = mongoose.model('Wallet', walletSchema);