const mongoose = require('mongoose');

/**
 * Stores phrases saved by a user (bookmarks/favorites).
 * Designed for quick lookup by user and phrase, while keeping
 * optional learning preferences (dialect/gender) and light progress.
 */
const myPhraseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    phrase: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Phrase',
        required: true,
        index: true
    },
    dialect: {
        type: String,
        enum: ['msa', 'egyptian', 'saudi'],
        lowercase: true,
        default: 'msa'
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'neutral'],
        default: 'neutral'
    }
}, {
    timestamps: true
});

// Prevent duplicate saves of the same phrase for a user
myPhraseSchema.index({ user: 1, phrase: 1 }, { unique: true });

module.exports = mongoose.model('MyPhrase', myPhraseSchema, 'myphrases');
