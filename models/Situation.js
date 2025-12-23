const mongoose = require('mongoose');

const situationSchema = new mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    arabicName: {
        type: String
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String
    },
    order: {
        type: Number,
        required: true,
        default: 0
    },
    phraseCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    tags: [{
        type: String
    }],
    isFree: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

situationSchema.index({ categoryId: 1, order: 1 });
situationSchema.index({ name: 1 });

module.exports = mongoose.model('Situation', situationSchema);