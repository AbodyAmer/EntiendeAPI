const mongoose = require('mongoose');
const { dialects } = require('../utils/enums')

const quizSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: [{
        id: {
            type: String,
            required: true,
        },
        label: {
            type: String,
            required: true
        },
        correct: {
            type: Boolean,
            required: true
        }
    }],
    type: {
        type: String,
        required: true,
        enum: ['single', 'multiple'],
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    }
})

const essaySchema = new mongoose.Schema({
    essayId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Essay', 
        required: true, 
        index: true 
    },
    dialect: {
        type: String,
        enum: dialects,
        required: true,
    }, 
    tashkeelContent: {
        type: String,
        required: true,
    },
    plainContent: {
        type: String,
        required: true,
    },
    quiz: [quizSchema]
}, {
    timestamps: true
})

module.exports = mongoose.model('EssayContent', essaySchema);