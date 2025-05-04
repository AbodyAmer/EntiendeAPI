const mongoose = require('mongoose');
const { dialects } = require('../utils/enums')

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
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('EssayContent', essaySchema);