const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    entryPrice: {
        type: Number,
        required: true
    },
    currentPrice: {
        type: Number,
        default: 0
    },
    marketValue: {
        type: Number,
        default: 0
    },
    pnl: {
        type: Number,
        default: 0
    },
    pnlPercentage: {
        type: Number,
        default: 0
    },
    sector: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const portfolioSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    contestId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Contest'
    },
    positions: [positionSchema],
    totalValue: {
        type: Number,
        default: 100000 // Starting virtual money
    },
    currentValue: {
        type: Number,
        default: 100000
    },
    cashBalance: {
        type: Number,
        default: 100000
    },
    totalPnL: {
        type: Number,
        default: 0
    },
    totalPnLPercentage: {
        type: Number,
        default: 0
    },
    rank: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    trades: [{
        type: {
            type: String,
            enum: ['buy', 'sell'],
            required: true
        },
        symbol: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        total: {
            type: Number,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Compound index for user-contest combination
portfolioSchema.index({ userId: 1, contestId: 1 }, { unique: true });
portfolioSchema.index({ contestId: 1, totalPnLPercentage: -1 }); // For leaderboard
portfolioSchema.index({ userId: 1 });

// Methods
portfolioSchema.methods.addPosition = function (positionData) {
    const existingPosition = this.positions.find(p => p.symbol === positionData.symbol);

    if (existingPosition) {
        // Average down/up the position
        const totalQuantity = existingPosition.quantity + positionData.quantity;
        const totalCost = (existingPosition.quantity * existingPosition.entryPrice) +
            (positionData.quantity * positionData.entryPrice);

        existingPosition.quantity = totalQuantity;
        existingPosition.entryPrice = totalCost / totalQuantity;
    } else {
        this.positions.push(positionData);
    }

    // Record the trade
    this.trades.push({
        type: 'buy',
        symbol: positionData.symbol,
        quantity: positionData.quantity,
        price: positionData.entryPrice,
        total: positionData.quantity * positionData.entryPrice
    });

    // Update cash balance
    this.cashBalance -= positionData.quantity * positionData.entryPrice;

    return this;
};

portfolioSchema.methods.removePosition = function (symbol, quantity) {
    const position = this.positions.find(p => p.symbol === symbol);

    if (!position) {
        throw new Error('Position not found');
    }

    if (position.quantity < quantity) {
        throw new Error('Insufficient quantity to sell');
    }

    const saleValue = quantity * position.currentPrice;

    // Record the trade
    this.trades.push({
        type: 'sell',
        symbol: symbol,
        quantity: quantity,
        price: position.currentPrice,
        total: saleValue
    });

    // Update cash balance
    this.cashBalance += saleValue;

    if (position.quantity === quantity) {
        // Remove position entirely
        this.positions = this.positions.filter(p => p.symbol !== symbol);
    } else {
        // Reduce position quantity
        position.quantity -= quantity;
    }

    return this;
};

portfolioSchema.methods.updatePortfolioValue = function () {
    let totalValue = this.cashBalance;

    this.positions.forEach(position => {
        position.marketValue = position.quantity * position.currentPrice;
        position.pnl = position.marketValue - (position.quantity * position.entryPrice);
        position.pnlPercentage = (position.pnl / (position.quantity * position.entryPrice)) * 100;

        totalValue += position.marketValue;
    });

    this.currentValue = totalValue;
    this.totalPnL = this.currentValue - this.totalValue;
    this.totalPnLPercentage = (this.totalPnL / this.totalValue) * 100;
    this.lastUpdated = new Date();

    return this;
};

module.exports = mongoose.model('Portfolio', portfolioSchema);