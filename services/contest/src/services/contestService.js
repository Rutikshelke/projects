const Contest = require('../models/Contest');
const Portfolio = require('../models/Portfolio');
const { logger } = require('../../../../libs/logging/logging');

// Service to update contest statuses
exports.updateContestStatuses = async () => {
    try {
        const now = new Date();

        // Update contests that should be active
        await Contest.updateMany(
            {
                status: { $in: ['open', 'full'] },
                startTime: { $lte: now }
            },
            {
                $set: { status: 'active' }
            }
        );

        // Update contests that should be completed
        const completedContests = await Contest.find({
            status: 'active',
            endTime: { $lte: now }
        });

        for (const contest of completedContests) {
            await finalizeContest(contest._id);
        }

        logger.info('Contest statuses updated successfully');
    } catch (error) {
        logger.error('Error updating contest statuses:', error);
    }
};

// Finalize contest and distribute prizes
async function finalizeContest(contestId) {
    try {
        const contest = await Contest.findById(contestId);
        if (!contest || contest.status === 'completed') {
            return;
        }

        // Get final leaderboard
        const portfolios = await Portfolio.find({ contestId })
            .sort({ totalPnLPercentage: -1 });

        // Update ranks
        for (let i = 0; i < portfolios.length; i++) {
            portfolios[i].rank = i + 1;
            await portfolios[i].save();
        }

        // Distribute prizes (this would integrate with wallet service)
        const winners = portfolios.slice(0, contest.prizeDistribution.length);

        for (let i = 0; i < winners.length; i++) {
            const winner = winners[i];
            const prize = contest.prizeDistribution[i];

            if (prize.amount > 0) {
                // Call wallet service to credit winnings
                // await creditWinnings(winner.userId, prize.amount, contestId);
                logger.info(`Prize of ${prize.amount} awarded to user ${winner.userId} for position ${prize.position} in contest ${contestId}`);
            }
        }

        // Update contest status
        contest.status = 'completed';
        await contest.save();

        logger.info(`Contest ${contestId} finalized with ${portfolios.length} participants`);
    } catch (error) {
        logger.error(`Error finalizing contest ${contestId}:`, error);
    }
}