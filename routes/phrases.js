const express = require('express');
const router = express.Router();
const PhraseV2 = require('../models/Phrase'); // PhraseV2 model with embedded variations
const Category = require('../models/Category');
const Situation = require('../models/Situation');

/**
 * GET /phrases
 * Get phrases with filtering, pagination
 *
 * Query params:
 * - category: Filter by category ID or name
 * - situation: Filter by situation ID or name
 * - difficulty: Filter by difficulty (beginner, intermediate, advanced)
 * - dialect: Filter to only show phrases that have this dialect
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 20, max: 100)
 */
router.get('/', async (req, res) => {
    try {
        const {
            category,
            situation,
            difficulty,
            dialect,
            page = 1,
            limit = 20
        } = req.query;

        // Build filter query
        const filter = {
            isActive: true,
            isApproved: true
        };

        // Handle category filter (can be ID or name)
        if (category) {
            // Check if it's an ObjectId or name
            if (category.match(/^[0-9a-fA-F]{24}$/)) {
                filter.category = category;
            } else {
                // Find category by name
                const categoryDoc = await Category.findOne({ name: category });
                if (categoryDoc) {
                    filter.category = categoryDoc._id;
                }
            }
        }

        // Handle situation filter (can be ID or name)
        if (situation) {
            // Check if it's an ObjectId or name
            if (situation.match(/^[0-9a-fA-F]{24}$/)) {
                filter.situation = situation;
            } else {
                // Find situation by name
                const situationDoc = await Situation.findOne({ name: situation });
                if (situationDoc) {
                    filter.situation = situationDoc._id;
                }
            }
        }

        if (difficulty) filter.difficulty = difficulty;

        // If dialect filter is provided, only return phrases that have that dialect
        if (dialect) {
            filter['variations.dialect'] = dialect;
        }

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        // Get total count for pagination metadata
        const total = await PhraseV2.countDocuments(filter);

        // Get phrases with embedded variations
        const phrases = await PhraseV2.find(filter)
            .populate('category', 'name nameAr')
            .populate('situation', 'name nameAr')
            .sort({ commonRank: 1 })
            .skip(skip)
            .limit(limitNum)
            .lean();

        // If dialect filter is specified, filter variations within each phrase
        if (dialect) {
            phrases.forEach(phrase => {
                phrase.variations = phrase.variations.filter(v => v.dialect === dialect);
                // Do the same for exercises
                phrase.exercises = phrase.exercises.filter(e => e.dialect === dialect);
            });
        }

        res.json({
            success: true,
            data: phrases,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
                hasNext: pageNum < Math.ceil(total / limitNum),
                hasPrev: pageNum > 1
            }
        });

    } catch (error) {
        console.error('Error fetching phrases:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch phrases',
            message: error.message
        });
    }
});

/**
 * GET /phrases/:id
 * Get a single phrase by ID with all its embedded data
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { dialect } = req.query;

        const phrase = await PhraseV2.findById(id)
            .populate('category', 'name nameAr')
            .populate('situation', 'name nameAr')
            .lean();

        if (!phrase) {
            return res.status(404).json({
                success: false,
                error: 'Phrase not found'
            });
        }

        // If dialect filter is specified, filter variations and exercises
        if (dialect) {
            phrase.variations = phrase.variations.filter(v => v.dialect === dialect);
            phrase.exercises = phrase.exercises.filter(e => e.dialect === dialect);
        }

        res.json({
            success: true,
            data: phrase
        });

    } catch (error) {
        console.error('Error fetching phrase:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch phrase',
            message: error.message
        });
    }
});

/**
 * GET /phrases/:id/variation/:dialect
 * Get a specific variation of a phrase
 */
router.get('/:id/variation/:dialect', async (req, res) => {
    try {
        const { id, dialect } = req.params;
        const { gender } = req.query;

        const phrase = await PhraseV2.findById(id).lean();

        if (!phrase) {
            return res.status(404).json({
                success: false,
                error: 'Phrase not found'
            });
        }

        // Find the specific variation
        let variation = phrase.variations.find(v => {
            if (gender) {
                return v.dialect === dialect && v.gender === gender;
            }
            return v.dialect === dialect && !v.gender; // Default to null gender
        });

        if (!variation) {
            return res.status(404).json({
                success: false,
                error: 'Variation not found for specified dialect' + (gender ? ' and gender' : '')
            });
        }

        res.json({
            success: true,
            data: {
                phraseId: phrase._id,
                englishTranslation: phrase.englishTranslation,
                context: phrase.context,
                variation
            }
        });

    } catch (error) {
        console.error('Error fetching variation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch variation',
            message: error.message
        });
    }
});

/**
 * GET /phrases/:id/exercise/:dialect
 * Get exercises for a specific phrase and dialect
 */
router.get('/:id/exercise/:dialect', async (req, res) => {
    try {
        const { id, dialect } = req.params;
        const { difficulty, type } = req.query;

        const phrase = await PhraseV2.findById(id).lean();

        if (!phrase) {
            return res.status(404).json({
                success: false,
                error: 'Phrase not found'
            });
        }

        // Filter exercises by dialect and optional parameters
        let exercises = phrase.exercises.filter(e => e.dialect === dialect);

        if (difficulty) {
            exercises = exercises.filter(e => e.difficulty === difficulty);
        }

        if (type) {
            exercises = exercises.filter(e => e.type === type);
        }

        if (exercises.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No exercises found for specified criteria'
            });
        }

        res.json({
            success: true,
            data: {
                phraseId: phrase._id,
                englishTranslation: phrase.englishTranslation,
                exercises
            }
        });

    } catch (error) {
        console.error('Error fetching exercises:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch exercises',
            message: error.message
        });
    }
});

/**
 * GET /phrases/random
 * Get random phrases for practice
 */
router.get('/random/practice', async (req, res) => {
    try {
        const {
            difficulty,
            dialect = 'msa',
            limit = 5
        } = req.query;

        const filter = {
            isActive: true,
            isApproved: true,
            'variations.dialect': dialect
        };

        if (difficulty) {
            filter.difficulty = difficulty;
        }

        const limitNum = Math.min(20, Math.max(1, parseInt(limit)));

        // Get random phrases using MongoDB's $sample
        const phrases = await PhraseV2.aggregate([
            { $match: filter },
            { $sample: { size: limitNum } }
        ]);

        // Filter variations and exercises to only the requested dialect
        phrases.forEach(phrase => {
            phrase.variations = phrase.variations.filter(v => v.dialect === dialect);
            phrase.exercises = phrase.exercises.filter(e => e.dialect === dialect);
        });

        res.json({
            success: true,
            data: phrases
        });

    } catch (error) {
        console.error('Error fetching random phrases:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch random phrases',
            message: error.message
        });
    }
});

/**
 * POST /phrases
 * Create a new phrase (admin only)
 */
router.post('/', async (req, res) => {
    try {
        // TODO: Add authentication middleware to check if user is admin

        const phraseData = req.body;

        // Validate required fields
        if (!phraseData.englishTranslation || !phraseData.category || !phraseData.situation) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: englishTranslation, category, situation'
            });
        }

        // Create new phrase
        const phrase = new PhraseV2(phraseData);
        await phrase.save();

        res.status(201).json({
            success: true,
            data: phrase
        });

    } catch (error) {
        console.error('Error creating phrase:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create phrase',
            message: error.message
        });
    }
});

/**
 * PUT /phrases/:id
 * Update a phrase (admin only)
 */
router.put('/:id', async (req, res) => {
    try {
        // TODO: Add authentication middleware to check if user is admin

        const { id } = req.params;
        const updates = req.body;

        const phrase = await PhraseV2.findByIdAndUpdate(
            id,
            { ...updates, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!phrase) {
            return res.status(404).json({
                success: false,
                error: 'Phrase not found'
            });
        }

        res.json({
            success: true,
            data: phrase
        });

    } catch (error) {
        console.error('Error updating phrase:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update phrase',
            message: error.message
        });
    }
});

/**
 * DELETE /phrases/:id
 * Soft delete a phrase (admin only)
 */
router.delete('/:id', async (req, res) => {
    try {
        // TODO: Add authentication middleware to check if user is admin

        const { id } = req.params;

        const phrase = await PhraseV2.findByIdAndUpdate(
            id,
            { isActive: false, updatedAt: new Date() },
            { new: true }
        );

        if (!phrase) {
            return res.status(404).json({
                success: false,
                error: 'Phrase not found'
            });
        }

        res.json({
            success: true,
            message: 'Phrase deactivated successfully'
        });

    } catch (error) {
        console.error('Error deleting phrase:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete phrase',
            message: error.message
        });
    }
});

module.exports = router;