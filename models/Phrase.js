const mongoose = require('mongoose');

/**
 * Simplified Schema v2 - Single collection for phrases with embedded variations and exercises
 * This replaces the 3-collection architecture (Phrases, PhraseVariations, BlankPhrases)
 */

// Embedded schema for dialect variations
const variationSchema = new mongoose.Schema({
    dialect: {
        type: String,
        required: true,
        enum: ['msa', 'egyptian', 'saudi']
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'neutral'],
        default: null
    },
    text: {
        type: String,
        required: true
    },
    tashkeelText: {
        type: String
    },
    transliteration: {
        type: String
    },
    audioUrl: {
        type: String
    },
    audioSlowUrl: {
        type: String
    }
}, { _id: false });

// Embedded schema for exercises (supports multiple game types)
const exerciseSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['fill-in-blank', 'reorder', 'multiple-choice', 'matching', 'typing'],
        default: 'fill-in-blank'
    },
    dialect: {
        type: String,
        required: true,
        enum: ['msa', 'egyptian', 'saudi']
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'neutral'],
        default: null
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    // For fill-in-blank: contains ALL options (correct + distractors)
    blankWords: [{
        word: { type: String, required: true },
        tashkeelWord: { type: String },
        transliteration: { type: String },
        isCorrect: { type: Boolean, required: true }
    }],
    // For reorder: words to arrange in correct order
    reorderWords: [{
        word: { type: String },
        correctPosition: { type: Number }
    }],
    // For matching: pairs to match
    matchingPairs: [{
        left: { type: String },
        right: { type: String }
    }],
    // Generic data field for future exercise types
    exerciseData: {
        type: mongoose.Schema.Types.Mixed
    },
    gameContext: {
        scenario: { type: String, required: true },
        hint: { type: String },
        instructions: { type: String }
    }
}, { _id: true }); // Keep _id for exercise tracking

// Embedded schema for follow-up phrases
const followUpSchema = new mongoose.Schema({
    englishTranslation: {
        type: String,
        required: true
    },
    whenHeard: {
        type: String
    },
    variations: [variationSchema] // Follow-ups also have dialect variations
}, { _id: false });

// Embedded schema for context
const contextSchema = new mongoose.Schema({
    whenToUse: {
        type: String,
        required: true
    },
    whoToSayTo: {
        type: String
    },
    speaker: {
        type: String
    },
    listener: {
        type: String
    },
    formality: {
        type: String,
        enum: ['informal', 'semi-formal', 'formal', 'very-formal', 'universal']
    },
    emotion: {
        type: String
    },
    culturalNote: {
        type: String
    }
}, { _id: false });

// Main Phrase Schema v2
const phraseV2Schema = new mongoose.Schema({
    // Core phrase information
    englishTranslation: {
        type: String,
        required: true
    },

    // Organization
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        index: true
    },
    situation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Situation',
        required: true,
        index: true
    },
    commonRank: {
        type: Number,
        required: true,
        min: 1,
        index: true
    },

    // Context and usage
    context: {
        type: contextSchema,
        required: true
    },

    // All dialect variations embedded
    variations: {
        type: [variationSchema],
        required: true,
        validate: {
            validator: function(v) {
                return v.length >= 1; // At least one variation required
            },
            message: 'At least one dialect variation is required'
        }
    },

    // All exercises embedded
    exercises: {
        type: [exerciseSchema],
        default: []
    },

    // Follow-up phrase (if any)
    followUp: {
        type: followUpSchema,
        default: null
    },

    // Metadata
    hasGenderVariation: {
        type: Boolean,
        default: false
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true,
        index: true
    },
    frequency: {
        type: String,
        enum: ['very_high', 'high', 'medium', 'low', 'very_low'],
        required: true
    },
    tags: [{
        type: String
    }],

    // Status flags
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    isApproved: {
        type: Boolean,
        default: false,
        index: true
    }

}, { timestamps: true });

// Indexes for common queries
phraseV2Schema.index({ category: 1, situation: 1, difficulty: 1, isActive: 1 });
phraseV2Schema.index({ commonRank: 1, isActive: 1 });
phraseV2Schema.index({ tags: 1 });

// Virtual to get all unique dialects available
phraseV2Schema.virtual('availableDialects').get(function() {
    return [...new Set(this.variations.map(v => v.dialect))];
});

// Method to get variation by dialect
phraseV2Schema.methods.getVariation = function(dialect, gender = null) {
    return this.variations.find(v =>
        v.dialect === dialect &&
        (gender ? v.gender === gender : true)
    );
};

// Method to get exercise by dialect and difficulty
phraseV2Schema.methods.getExercise = function(dialect, difficulty = null) {
    return this.exercises.find(e =>
        e.dialect === dialect &&
        (difficulty ? e.difficulty === difficulty : true)
    );
};

module.exports = mongoose.model('Phrase', phraseV2Schema);