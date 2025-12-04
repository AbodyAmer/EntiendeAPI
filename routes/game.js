const express = require('express');
const { requireVerifiedAuth } = require('../utils/requireVerifiedAuth');
const Phrase = require('../models/Phrase');
const BlankHistory = require('../models/blankhistory');
const Category = require('../models/Category');
const Situation = require('../models/Situation');
const User = require('../models/User');
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
            limit = 10,
            excludeSeen = 'true'
        } = req.query;

        console.log(req.query);

        // Check if this is the marketing user
        const user = await User.findById(userId).select('email').lean();
        const isMarketingUser = user?.email === 'abdullah.eshaq94@gmail.com';

        // Build filter - exercises are now nested by dialect
        const filter = {
            isActive: true,
            isApproved: true,
            exercises: { $exists: true, $ne: null } // Only phrases with exercises
        };

        // If marketing user, include showme flag filter
        if (isMarketingUser) {
            filter.showme = true;
        }

        // Filter by exercise type within any dialect array
        if (type) {
            filter.$or = [
                { 'exercises.saudi.type': type },
                { 'exercises.egyptian.type': type },
                { 'exercises.msa.type': type }
            ];
        }

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

        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

        // SIMPLE QUERY - No complex aggregation!
        const phrases = await Phrase.aggregate([
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
                    gameContext: 1, // ✅ GAME CONTEXT AT PHRASE LEVEL
                    exercises: 1,
                    followUp: 1, // ✅ FOLLOW-UPS INCLUDED!
                    difficulty: 1,
                    hasGenderVariation: 1,
                    showme: 1 // Include showme flag for marketing user
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
        const phrase = await Phrase.findById(phraseId);
        if (!phrase) {
            return res.status(404).json({
                success: false,
                error: 'Phrase not found'
            });
        }

        // Find the specific exercise - exercises are now nested by dialect
        let exercise = null;
        let exerciseDialect = dialect;

        // Search through dialect arrays to find the exercise by ID
        const dialects = ['saudi', 'egyptian', 'msa'];
        for (const d of dialects) {
            if (phrase.exercises && phrase.exercises[d]) {
                exercise = phrase.exercises[d].find(ex => ex._id.toString() === exerciseId);
                if (exercise) {
                    exerciseDialect = d;
                    break;
                }
            }
        }

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
            dialect: dialect || exerciseDialect,
            difficulty: difficulty || exercise.difficulty,
            userAnswer,
            isCorrect,
            timeSpent
        });

        await progress.save();

        // Get the next phrase recommendation if this was correct
        let nextPhrase = null;
        if (isCorrect) {
            const nextPhrases = await Phrase.aggregate([
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
                explanation: phrase.gameContext?.hint || null, // gameContext is now at phrase level
                scenario: phrase.gameContext?.scenario || null,
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

/**
 * POST /game/history
 * Save exercise history
 *
 * Body:
 * - phraseId: ID of the phrase
 * - dialect: Which dialect was used (egyptian, saudi, msa)
 * - gender: Which gender variation was used (male, female, neutral)
 * - isCorrect: Whether the user answered correctly
 * - gameType: Type of game (fill-in-blank, reorder, multiple-choice, matching, typing)
 */
router.post('/history', requireVerifiedAuth, async (req, res) => {
    try {
        const userId = req.user;
        
        const { phraseId, dialect, gender, isCorrect, gameType } = req.body;

        // Validate required fields
        if (!phraseId || !dialect || !gender || typeof isCorrect !== 'boolean' || !gameType) {
            return res.status(400).json({
                success: false,
                error: 'phraseId, dialect, gender, isCorrect, and gameType are required'
            });
        }

        // Validate gameType
        const validGameTypes = ['fill-in-blank', 'reorder', 'multiple-choice', 'matching', 'typing'];
        if (!validGameTypes.includes(gameType)) {
            return res.status(400).json({
                success: false,
                error: `Invalid gameType. Must be one of: ${validGameTypes.join(', ')}`
            });
        }

        // Validate dialect
        if (!['egyptian', 'saudi', 'msa'].includes(dialect)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid dialect. Must be egyptian, saudi, or msa'
            });
        }

        // Validate gender
        if (!['male', 'female', 'neutral'].includes(gender)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid gender. Must be male, female, or neutral'
            });
        }

        // Verify phrase exists
        const phrase = await Phrase.findById(phraseId);
        if (!phrase) {
            return res.status(404).json({
                success: false,
                error: 'Phrase not found'
            });
        }

        // Only save history for fill-in-blank for now
        // Other game types don't have history collections yet
        if (gameType === 'fill-in-blank') {
            const history = new BlankHistory({
                user: userId,
                phrase: phraseId,
                dialect,
                gender,
                isCorrect
            });

            await history.save();

            res.status(201).json({
                success: true,
                data: {
                    id: history._id,
                    phraseId: history.phrase,
                    dialect: history.dialect,
                    gender: history.gender,
                    isCorrect: history.isCorrect,
                    gameType: 'fill-in-blank',
                    createdAt: history.createdAt
                }
            });
        } else {
            // For other game types, acknowledge but don't save (no schema yet)
            res.status(200).json({
                success: true,
                message: `History tracking for ${gameType} is not implemented yet`,
                data: {
                    phraseId,
                    dialect,
                    gender,
                    isCorrect,
                    gameType
                }
            });
        }

    } catch (error) {
        console.error('Error saving game history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save history'
        });
    }
});

router.get('/situations', requireVerifiedAuth, async (req, res) => {
    try {
        const situations = await Situation.find({ isActive: true }).select('name description displayName').lean();
        res.json({
            success: true,
            data: situations
        });
    } catch (error) {
        console.error('Error fetching situations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch situations'
        });
    }
});

module.exports = router;