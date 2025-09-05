// Fill in the blanks game model
const mongoose = require('mongoose');

const fillinHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    sentence: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fillin',
        required: true,
        index: true
    },
    isCorrect: {
        type: Boolean,
        required: true
    },
    isReview: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('FillinHistory', fillinHistorySchema);