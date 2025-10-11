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
    msa: {
        type: dialectGenderSchema,
        default: null
    },
    egyptian: {
        type: dialectGenderSchema,
        default: null
    },
    saudi: {
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
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    // The display sentence/phrase with blank placeholder (e.g., "_____ بكرة؟" or "أنت _____ بكرة؟")
    displaySentence: {
        type: String,
        required: true
    },
    // Display sentence with tashkeel
    displaySentenceTashkeel: {
        type: String
    },
    // Transliteration of the full sentence (optional)
    displaySentenceTransliteration: {
        type: String
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
    }
}, { _id: true });

// Exercises organized by dialect (primary query dimension), each dialect has array of variants
const exercisesSchema = new mongoose.Schema({
    msa: {
        type: [exerciseVariantSchema],
        default: []
    },
    egyptian: {
        type: [exerciseVariantSchema],
        default: []
    },
    saudi: {
        type: [exerciseVariantSchema],
        default: []
    }
}, { _id: false });

// Embedded schema for follow-up phrases
const followUpSchema = new mongoose.Schema({
    englishTranslation: {
        type: String,
        required: true
    },
    whenHeard: {
        type: String
    },
    isSamePerson: {
        type: Boolean,
        default: false,
        required: true
    },
    variations: {
        type: variationsSchema,
        required: true
    }
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

    // All dialect variations embedded (nested by dialect then gender)
    variations: {
        type: variationsSchema,
        required: true,
        validate: {
            validator: function(v) {
                // At least one dialect must have at least one gender variation
                const dialects = ['msa', 'egyptian', 'saudi'];
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

// Indexes for nested dialect queries (checking if dialect exists)
phraseV2Schema.index({ 'variations.msa': 1 });
phraseV2Schema.index({ 'variations.egyptian': 1 });
phraseV2Schema.index({ 'variations.saudi': 1 });

// Virtual to get all unique dialects available
phraseV2Schema.virtual('availableDialects').get(function() {
    const dialects = [];
    if (this.variations.msa && (this.variations.msa.male || this.variations.msa.female || this.variations.msa.neutral)) {
        dialects.push('msa');
    }
    if (this.variations.egyptian && (this.variations.egyptian.male || this.variations.egyptian.female || this.variations.egyptian.neutral)) {
        dialects.push('egyptian');
    }
    if (this.variations.saudi && (this.variations.saudi.male || this.variations.saudi.female || this.variations.saudi.neutral)) {
        dialects.push('saudi');
    }
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
    if (filters.difficulty) {
        exercises = exercises.filter(e => e.difficulty === filters.difficulty);
    }
    if (filters.type) {
        exercises = exercises.filter(e => e.type === filters.type);
    }

    return exercises;
};

// Method to get a single exercise by dialect, gender, difficulty
phraseV2Schema.methods.getExercise = function(dialect, gender, difficulty) {
    const exercises = this.getExercises(dialect, { gender, difficulty });
    return exercises.length > 0 ? exercises[0] : null;
};

module.exports = mongoose.model('Phrase', phraseV2Schema);