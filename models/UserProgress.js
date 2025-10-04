const mongoose = require('mongoose');

/**
 * UserProgress Model - Tracks user's progress on exercises
 * Replaces the stats embedded in BlankPhrase
 */

const attemptSchema = new mongoose.Schema({
    exerciseId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    dialect: {
        type: String,
        required: true,
        enum: ['msa', 'egyptian', 'saudi']
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    userAnswer: [{
        type: String
    }],
    isCorrect: {
        type: Boolean,
        required: true
    },
    attemptedAt: {
        type: Date,
        default: Date.now
    },
    timeSpent: {
        type: Number, // in seconds
        default: 0
    }
}, { _id: false });

const userProgressSchema = new mongoose.Schema({
    // User reference
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Phrase reference
    phraseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Phrase',
        required: true,
        index: true
    },

    // Track all attempts on this phrase
    attempts: [attemptSchema],

    // Aggregated stats for this phrase
    stats: {
        totalAttempts: {
            type: Number,
            default: 0
        },
        correctAttempts: {
            type: Number,
            default: 0
        },
        successRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        lastAttempted: {
            type: Date,
            default: null
        },
        // Track per-dialect performance
        dialectStats: {
            msa: {
                attempts: { type: Number, default: 0 },
                correct: { type: Number, default: 0 }
            },
            egyptian: {
                attempts: { type: Number, default: 0 },
                correct: { type: Number, default: 0 }
            },
            saudi: {
                attempts: { type: Number, default: 0 },
                correct: { type: Number, default: 0 }
            }
        },
        // Track per-difficulty performance
        difficultyStats: {
            beginner: {
                attempts: { type: Number, default: 0 },
                correct: { type: Number, default: 0 }
            },
            intermediate: {
                attempts: { type: Number, default: 0 },
                correct: { type: Number, default: 0 }
            },
            advanced: {
                attempts: { type: Number, default: 0 },
                correct: { type: Number, default: 0 }
            }
        }
    },

    // Learning status
    mastery: {
        type: String,
        enum: ['new', 'learning', 'familiar', 'mastered'],
        default: 'new'
    },

    // Spaced repetition data
    nextReviewDate: {
        type: Date,
        default: null
    },
    reviewInterval: {
        type: Number, // days until next review
        default: 1
    }

}, { timestamps: true });

// Compound indexes for queries
userProgressSchema.index({ userId: 1, phraseId: 1 }, { unique: true });
userProgressSchema.index({ userId: 1, 'stats.successRate': 1 });
userProgressSchema.index({ userId: 1, mastery: 1 });
userProgressSchema.index({ userId: 1, nextReviewDate: 1 });

// Method to record a new attempt
userProgressSchema.methods.recordAttempt = function(attempt) {
    this.attempts.push(attempt);

    // Update stats
    this.stats.totalAttempts++;
    if (attempt.isCorrect) {
        this.stats.correctAttempts++;
    }

    this.stats.successRate = Math.round(
        (this.stats.correctAttempts / this.stats.totalAttempts) * 100
    );

    this.stats.lastAttempted = new Date();

    // Update dialect stats
    if (this.stats.dialectStats[attempt.dialect]) {
        this.stats.dialectStats[attempt.dialect].attempts++;
        if (attempt.isCorrect) {
            this.stats.dialectStats[attempt.dialect].correct++;
        }
    }

    // Update difficulty stats
    if (this.stats.difficultyStats[attempt.difficulty]) {
        this.stats.difficultyStats[attempt.difficulty].attempts++;
        if (attempt.isCorrect) {
            this.stats.difficultyStats[attempt.difficulty].correct++;
        }
    }

    // Update mastery level
    this.updateMastery();

    // Update spaced repetition
    this.updateSpacedRepetition(attempt.isCorrect);
};

// Method to update mastery level based on performance
userProgressSchema.methods.updateMastery = function() {
    const successRate = this.stats.successRate;
    const attempts = this.stats.totalAttempts;

    if (attempts < 3) {
        this.mastery = 'new';
    } else if (successRate >= 90 && attempts >= 5) {
        this.mastery = 'mastered';
    } else if (successRate >= 70) {
        this.mastery = 'familiar';
    } else {
        this.mastery = 'learning';
    }
};

// Method to update spaced repetition schedule
userProgressSchema.methods.updateSpacedRepetition = function(wasCorrect) {
    if (wasCorrect) {
        // Increase interval if correct
        this.reviewInterval = Math.min(this.reviewInterval * 2, 30); // Max 30 days
    } else {
        // Reset interval if incorrect
        this.reviewInterval = 1;
    }

    this.nextReviewDate = new Date();
    this.nextReviewDate.setDate(this.nextReviewDate.getDate() + this.reviewInterval);
};

// Static method to get phrases due for review
userProgressSchema.statics.getDueForReview = function(userId, limit = 10) {
    return this.find({
        userId,
        nextReviewDate: { $lte: new Date() }
    })
    .sort({ nextReviewDate: 1 })
    .limit(limit)
    .populate('phraseId');
};

// Static method to get struggling phrases for a user
userProgressSchema.statics.getStrugglingPhrases = function(userId, limit = 10) {
    return this.find({
        userId,
        'stats.successRate': { $lt: 50 },
        'stats.totalAttempts': { $gte: 2 }
    })
    .sort({ 'stats.successRate': 1 })
    .limit(limit)
    .populate('phraseId');
};

module.exports = mongoose.model('UserProgress', userProgressSchema);