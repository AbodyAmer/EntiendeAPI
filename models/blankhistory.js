const mongoose = require('mongoose');

/**
 * BlankHistory Schema
 * Simple tracking of fill-in-blank exercise attempts
 */

const blankHistorySchema = new mongoose.Schema({
    // User who performed the exercise
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // The phrase being practiced
    phrase: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Phrase',
        required: true,
        index: true
    },

    // Dialect used for this exercise
    dialect: {
        type: String,
        enum: ['egyptian', 'saudi', 'msa'],
        required: true
    },

    // Gender variation used
    gender: {
        type: String,
        enum: ['male', 'female', 'neutral'],
        required: true
    },

    // Was this attempt correct?
    isCorrect: {
        type: Boolean,
        required: true
    }

}, {
    timestamps: true
});

// Index for querying user's phrase history
blankHistorySchema.index({ user: 1, phrase: 1 });

module.exports = mongoose.model('BlankHistory', blankHistorySchema);
