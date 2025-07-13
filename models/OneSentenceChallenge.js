const mongoose = require('mongoose');
const { dialects } = require('../utils/enums');

const sentenceSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    textWithTashkeel: {
        type: String,
        required: true,
        trim: true
    },
    isCorrect: {
        type: Boolean,
        required: true
    }
}, { _id: false });

const dialectSchema = new mongoose.Schema({
    dialect: {
        type: String,
        required: true,
        enum: dialects
    },
    sentences: {
        type: [sentenceSchema],
        required: true,
        validate: [
            {
                validator: function(sentences) {
                    return sentences.length >= 2;
                },
                message: 'Each dialect must have at least 2 sentences'
            }
        ]
    }
}, { _id: false });

const oneSentenceChallengeSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true,
        trim: true
    },
    dialects: {
        type: [dialectSchema],
        required: true,
        validate: [
            {
                validator: function(dialectsArray) {
                    return dialectsArray.length >= 1;
                },
                message: 'At least one dialect must be provided'
            },
            {
                validator: function(dialectsArray) {
                    const dialectNames = dialectsArray.map(d => d.dialect);
                    return dialectNames.length === new Set(dialectNames).size;
                },
                message: 'Dialect names must be unique'
            }
        ]
    },
    explain: {
        type: String,
        required: true,
        trim: true
    },
    level: {
        type: Number,
        min: 1,
        max: 19,
        required: true,
        index: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Create indexes for better query performance
oneSentenceChallengeSchema.index({ level: 1, isActive: 1 });

module.exports = mongoose.model('OneSentenceChallenge', oneSentenceChallengeSchema);
