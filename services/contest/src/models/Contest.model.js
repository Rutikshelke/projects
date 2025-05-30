const mongoose = require('mongoose');

const prizeSchema = new mongoose.Schema({
    position: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        required: true
    }
});

const contestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'custom'],
        required: true
    },
    entryFee: {
        type: Number,
        required: true,
        min: 0
    },
    maxParticipants: {
        type: Number,
        required: true,
        min: 2
    },
    minParticipants: {
        type: Number,
        required: true,
        min: 2
    },
    currentParticipants: {
        type: Number,
        default: 0
    },
    prizePool: {
        type: Number,
        default: 0
    },
    prizeDistribution: [prizeSchema],
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    registrationDeadline: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'open', 'full', 'active', 'completed', 'cancelled'],
        default: 'draft'
    },
    rules: {
        maxPositionsPerStock: {
            type: Number,
            default: 1
        },
        allowedSectors: [{
            type: String
        }],
        blockedStocks: [{
            type: String
        }],
        maxPortfolioValue: {
            type: Number,
            default: 100000
        },
        minPortfolioValue: {
            type: Number,
            default: 1000
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String
    }],
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes
contestSchema.index({ status: 1 });
contestSchema.index({ startTime: 1 });
contestSchema.index({ endTime: 1 });
contestSchema.index({ type: 1 });
contestSchema.index({ entryFee: 1 });
contestSchema.index({ featured: 1 });

// Virtual for checking if contest is full
contestSchema.virtual('isFull').get(function () {
    return this.currentParticipants >= this.maxParticipants;
});

// Virtual for checking if registration is open
contestSchema.virtual('registrationOpen').get(function () {
    const now = new Date();
    return now < this.registrationDeadline && this.status === 'open' && !this.isFull;
});

// Pre-save middleware to update status
contestSchema.pre('save', function (next) {
    const now = new Date();

    if (this.status === 'open' && this.currentParticipants >= this.maxParticipants) {
        this.status = 'full';
    } else if ((this.status === 'open' || this.status === 'full') && now >= this.startTime) {
        this.status = 'active';
    } else if (this.status === 'active' && now >= this.endTime) {
        this.status = 'completed';
    }

    next();
});

module.exports = mongoose.model('Contest', contestSchema);