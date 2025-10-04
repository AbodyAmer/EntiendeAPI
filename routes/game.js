const express = require('express');
const { requireVerifiedAuth } = require('../utils/requireVerifiedAuth');
const PhraseV2 = require('../models/Phrase');
const UserProgress = require('../models/UserProgress');
const Category = require('../models/Category');
const Situation = require('../models/Situation');
const router = express.Router();

/**
 * GET /game/v2/exercises
 * Get random exercises using simplified schema
 * Returns complete phrases with all dialects, exercises, and follow-ups
 *
 * Query params:
 * - type: Exercise type (fill-in-blank, reorder, multiple-choice, etc.)
 * - difficulty: Filter by difficulty (beginner, intermediate, advanced)
 * - categoryId: Filter by category ObjectId
 * - situationId: Filter by situation ObjectId
 * - commonRankStart: Start of common rank range (e.g., 1)
 * - commonRankEnd: End of common rank range (e.g., 100)
 * - limit: Number of unique phrases to return (default: 10, max: 50)
 * - excludeSeen: Exclude recently seen phrases (default: true)
 */
router.get('/exercises', requireVerifiedAuth, async (req, res) => {
    try {
        const userId = req.user;
        const {
            type = 'fill-in-blank', // Default to fill-in-blank
            difficulty,
            categoryId,
            situationId,
            commonRankStart,
            commonRankEnd,
            limit = 5,
            excludeSeen = 'true'
        } = req.query;

        // Build filter - SIMPLE!
        const filter = {
            isActive: true,
            isApproved: true,
            'exercises.0': { $exists: true }, // Only phrases with exercises
            'exercises.type': type // Filter by exercise type
        };

        if (difficulty) {
            filter.difficulty = difficulty;
        }

        if (categoryId) {
            filter.category = categoryId;
        }

        if (situationId) {
            filter.situation = situationId;
        }

        if (commonRankStart || commonRankEnd) {
            filter.commonRank = {};
            if (commonRankStart) {
                filter.commonRank.$gte = parseInt(commonRankStart);
            }
            if (commonRankEnd) {
                filter.commonRank.$lte = parseInt(commonRankEnd);
            }
        }

        // Exclude recently seen phrases if requested
        if (excludeSeen === 'true') {
            const recentProgress = await UserProgress.find({
                userId,
                'stats.lastAttempted': {
                    $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
            }).select('phraseId');

            const seenPhraseIds = recentProgress.map(p => p.phraseId);
            if (seenPhraseIds.length > 0) {
                filter._id = { $nin: seenPhraseIds };
            }
        }

        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

        // SIMPLE QUERY - No complex aggregation!
        const phrases = await PhraseV2.aggregate([
            { $match: filter },
            { $sample: { size: limitNum } },
            // Optionally populate category and situation names,
            {
                $project: {
                    _id: 1,
                    englishTranslation: 1,
                    category: 1,
                    situation: 1,
                    commonRank: 1,
                    context: 1,
                    variations: 1,
                    exercises: 1,
                    followUp: 1, // ✅ FOLLOW-UPS INCLUDED!
                    difficulty: 1,
                    hasGenderVariation: 1
                }
            }
        ]);

        res.json({
            success: true,
            data: phrases,
            count: phrases.length
        });

    } catch (error) {
        console.error('Error fetching fill-in-blank exercises:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch exercises'
        });
    }
});

/**
 * POST /game/v2/submit
 * Submit an answer for a fill-in-the-blank exercise
 *
 * Body:
 * - phraseId: ID of the phrase
 * - exerciseId: ID of the specific exercise within the phrase
 * - dialect: Which dialect was attempted
 * - difficulty: Which difficulty was attempted
 * - answer: Array of selected words/phrases
 * - timeSpent: Time spent in seconds (optional)
 */
router.post('/submit', requireVerifiedAuth, async (req, res) => {
    try {
        const userId = req.user;
        const {
            phraseId,
            exerciseId,
            dialect,
            difficulty,
            answer,
            timeSpent = 0
        } = req.body;

        if (!phraseId || !exerciseId || !answer) {
            return res.status(400).json({
                success: false,
                error: 'phraseId, exerciseId, and answer are required'
            });
        }

        // Get the phrase
        const phrase = await PhraseV2.findById(phraseId);
        if (!phrase) {
            return res.status(404).json({
                success: false,
                error: 'Phrase not found'
            });
        }

        // Find the specific exercise
        const exercise = phrase.exercises.id(exerciseId);
        if (!exercise) {
            return res.status(404).json({
                success: false,
                error: 'Exercise not found'
            });
        }

        // Validate answer
        const userAnswer = Array.isArray(answer) ? answer : [answer];
        const correctAnswers = exercise.blankWords
            .filter(word => word.isCorrect)
            .map(word => word.word);

        const isCorrect = userAnswer.length === correctAnswers.length &&
            userAnswer.every((ans, idx) => ans === correctAnswers[idx]);

        // Find or create user progress
        let progress = await UserProgress.findOne({ userId, phraseId });
        if (!progress) {
            progress = new UserProgress({
                userId,
                phraseId
            });
        }

        // Record the attempt
        progress.recordAttempt({
            exerciseId,
            dialect: dialect || exercise.dialect,
            difficulty: difficulty || exercise.difficulty,
            userAnswer,
            isCorrect,
            timeSpent
        });

        await progress.save();

        // Get the next phrase recommendation if this was correct
        let nextPhrase = null;
        if (isCorrect) {
            const nextPhrases = await PhraseV2.aggregate([
                {
                    $match: {
                        _id: { $ne: phraseId },
                        category: phrase.category,
                        difficulty: phrase.difficulty,
                        isActive: true,
                        isApproved: true
                    }
                },
                { $sample: { size: 1 } }
            ]);
            nextPhrase = nextPhrases[0] || null;
        }

        res.json({
            success: true,
            data: {
                isCorrect,
                correctAnswer: correctAnswers,
                userAnswer,
                explanation: exercise.gameContext.hint,
                followUp: isCorrect ? phrase.followUp : null, // Include follow-up if correct
                progress: {
                    successRate: progress.stats.successRate,
                    totalAttempts: progress.stats.totalAttempts,
                    mastery: progress.mastery
                },
                nextPhrase // Recommend next phrase
            }
        });

    } catch (error) {
        console.error('Error submitting answer:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit answer'
        });
    }
});

/**
 * GET /game/v2/review
 * Get phrases due for spaced repetition review
 */
router.get('/review', requireVerifiedAuth, async (req, res) => {
    try {
        const userId = req.user;
        const { limit = 10 } = req.query;

        const dueForReview = await UserProgress.getDueForReview(userId, parseInt(limit));

        res.json({
            success: true,
            data: dueForReview,
            count: dueForReview.length
        });

    } catch (error) {
        console.error('Error fetching review phrases:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch review phrases'
        });
    }
});

/**
 * GET /game/v2/struggling
 * Get phrases the user is struggling with
 */
router.get('/struggling', requireVerifiedAuth, async (req, res) => {
    try {
        const userId = req.user;
        const { limit = 10 } = req.query;

        const strugglingPhrases = await UserProgress.getStrugglingPhrases(userId, parseInt(limit));

        res.json({
            success: true,
            data: strugglingPhrases,
            count: strugglingPhrases.length
        });

    } catch (error) {
        console.error('Error fetching struggling phrases:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch struggling phrases'
        });
    }
});

/**
 * GET /game/v2/stats
 * Get user's overall game statistics
 */
router.get('/stats', requireVerifiedAuth, async (req, res) => {
    try {
        const userId = req.user;

        const userStats = await UserProgress.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalPhrases: { $sum: 1 },
                    totalAttempts: { $sum: '$stats.totalAttempts' },
                    totalCorrect: { $sum: '$stats.correctAttempts' },
                    avgSuccessRate: { $avg: '$stats.successRate' },
                    masteredCount: {
                        $sum: { $cond: [{ $eq: ['$mastery', 'mastered'] }, 1, 0] }
                    },
                    familiarCount: {
                        $sum: { $cond: [{ $eq: ['$mastery', 'familiar'] }, 1, 0] }
                    },
                    learningCount: {
                        $sum: { $cond: [{ $eq: ['$mastery', 'learning'] }, 1, 0] }
                    },
                    newCount: {
                        $sum: { $cond: [{ $eq: ['$mastery', 'new'] }, 1, 0] }
                    }
                }
            }
        ]);

        const stats = userStats[0] || {
            totalPhrases: 0,
            totalAttempts: 0,
            totalCorrect: 0,
            avgSuccessRate: 0,
            masteredCount: 0,
            familiarCount: 0,
            learningCount: 0,
            newCount: 0
        };

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user stats'
        });
    }
});

module.exports = router;