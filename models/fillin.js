// Fill in the blanks game model
const mongoose = require('mongoose');
const { dialects } = require('../utils/enums');

const sentencesSchema = new mongoose.Schema({
    dialect: {
        type: String,
        required: true,
        enum: dialects
    },
    text: {
        type: String,
        required: true
    },
    tashkeelText: {
        type: String,
        required: false
    },
    fillinWords: [
        {
            word: {
                type: String,
                required: true
            },
            tashkeelWord: {
                type: String,
                required: false
            },
            isCorrect: {
                type: Boolean,
                required: true
            }
        }
    ]
});

const fillinSchema = new mongoose.Schema({
    level: {
        type: Number,
        min: 1,
        max: 19,
        required: true,
        index: true
    },
    sentences: [sentencesSchema],
    englishTranslation: {
        type: String,
        required: true
    },
    isApproved: {
        type: Boolean,
        default: false
    },

}, { timestamps: true });

module.exports = mongoose.model('Fillin', fillinSchema);