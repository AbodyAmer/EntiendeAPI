const mongoose = require('mongoose');

/**
 * Simplified Schema v2 - Single collection for phrases with embedded variations and exercises
 * This replaces the 3-collection architecture (Phrases, PhraseVariations, BlankPhrases)
 */

// Embedded schema for individual variation (text + audio for one dialect-gender combo)
const variationTextSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    hasAudio: {
        type: Boolean,
        default: false
    }
});

// Schema for gender-based variations within a dialect
const dialectGenderSchema = new mongoose.Schema({
    male: {
        type: variationTextSchema,
        default: null
    },
    female: {
        type: variationTextSchema,
        default: null
    },
    neutral: {
        type: variationTextSchema,
        default: null
    }
}, { _id: false });

// Main variations structure: nested by dialect then gender
const variationsSchema = new mongoose.Schema({
    spain: {
        type: dialectGenderSchema,
        default: null
    },
    mexico: {
        type: dialectGenderSchema,
        default: null
    },
    argentina: {
        type: dialectGenderSchema,
        default: null
    },
    puerto_rico: {
        type: dialectGenderSchema,
        default: null
    },
    colombia: {
        type: dialectGenderSchema,
        default: null
    }
}, { _id: false });

// Schema for game context (shared across all exercises for this phrase)
const gameContextSchema = new mongoose.Schema({
    scenario: {
        type: String,
        required: true
    },
    hint: {
        type: String
    },
    // Instructions by exercise type (avoids duplication)
    instructions: {
        type: Map,
        of: String,
        default: () => new Map()
    }
}, { _id: false });

// Schema for a single exercise variant
const exerciseVariantSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['fill-in-blank', 'reorder', 'multiple-choice', 'matching', 'typing'],
        default: 'fill-in-blank'
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'neutral'],
        required: true
    },
    // The display sentence/phrase with blank placeholder (e.g., "Estoy _____" or "Tomo el _____")
    displaySentence: {
        type: String,
        required: true
    },
    // For fill-in-blank: contains ALL options (correct + distractors)
    blankWords: [{
        word: { type: String, required: true },
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
    }
}, { _id: true });

// Exercises organized by dialect (primary query dimension), each dialect has array of variants
const exercisesSchema = new mongoose.Schema({
    spain: {
        type: [exerciseVariantSchema],
        default: []
    },
    mexico: {
        type: [exerciseVariantSchema],
        default: []
    },
    argentina: {
        type: [exerciseVariantSchema],
        default: []
    },
    puerto_rico: {
        type: [exerciseVariantSchema],
        default: []
    },
    colombia: {
        type: [exerciseVariantSchema],
        default: []
    }
}, { _id: false });


// Embedded schema for context
const contextSchema = new mongoose.Schema({
    whenToUse: {
        type: String,
        required: true
    },
    formality: {
        type: String,
        enum: ['informal', 'semi-formal', 'formal', 'universal', 'neutral']
    }
}, { _id: false });

// Main Phrase Schema v2
const phraseV2Schema = new mongoose.Schema({
    // Core phrase information
    englishTranslation: {
        type: String,
        required: true
    },
    intent: {
        type: String
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

    // Context and usage
    context: {
        type: contextSchema,
        required: true
    },

    // All dialect variations embedded (nested by dialect then gender)
    variations: {
        type: variationsSchema,
        required: true,
        validate: {
            validator: function(v) {
                // At least one dialect must have at least one gender variation
                const dialects = ['spain', 'mexico', 'argentina', 'puerto_rico', 'colombia'];
                return dialects.some(dialect => {
                    if (v[dialect]) {
                        return v[dialect].male || v[dialect].female || v[dialect].neutral;
                    }
                    return false;
                });
            },
            message: 'At least one dialect with one gender variation is required'
        }
    },

    // Game context (shared across all exercises)
    gameContext: {
        type: gameContextSchema,
        default: null
    },

    // All exercises embedded (nested by dialect then gender)
    exercises: {
        type: exercisesSchema,
        default: null
    },

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
    },
    showme: {
        type: Boolean,
        default: false,
        index: true
    }

}, { timestamps: true });



// Virtual to get all unique dialects available
phraseV2Schema.virtual('availableDialects').get(function() {
    const dialects = [];
    const dialectKeys = ['spain', 'mexico', 'argentina', 'puerto_rico', 'colombia'];

    dialectKeys.forEach(dialect => {
        if (this.variations[dialect] && (this.variations[dialect].male || this.variations[dialect].female || this.variations[dialect].neutral)) {
            dialects.push(dialect);
        }
    });

    return dialects;
});

// Method to get variation by dialect and gender
phraseV2Schema.methods.getVariation = function(dialect, gender = 'neutral') {
    if (!this.variations[dialect]) {
        return null;
    }
    // Try requested gender first, fallback to neutral, then any available
    return this.variations[dialect][gender] ||
           this.variations[dialect].neutral ||
           this.variations[dialect].male ||
           this.variations[dialect].female;
};

// Method to get all gender variations for a dialect
phraseV2Schema.methods.getDialectVariations = function(dialect) {
    return this.variations[dialect] || null;
};

// Method to get exercises by dialect with optional filters
phraseV2Schema.methods.getExercises = function(dialect, filters = {}) {
    if (!this.exercises || !this.exercises[dialect]) {
        return [];
    }

    let exercises = this.exercises[dialect];

    // Apply filters
    if (filters.gender) {
        exercises = exercises.filter(e => e.gender === filters.gender);
    }
    if (filters.type) {
        exercises = exercises.filter(e => e.type === filters.type);
    }

    return exercises;
};


module.exports = mongoose.model('Phrase', phraseV2Schema);