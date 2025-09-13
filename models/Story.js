const mongoose = require('mongoose');
const { dialects } = require('../utils/enums')

const chapterContentSchema = new mongoose.Schema({
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
}, { _id: false })

const chapterSchema = new mongoose.Schema({
    chapterNumber: {
        type: Number,
        required: true,
        min: 1
    },
    chapterTitle: {
        type: String,
        required: true
    },
    content: [chapterContentSchema]
}, { _id: false })

const storySchema = new mongoose.Schema({
    titleAr: {
        type: String, 
        required: true, 
    },
    titleEn: {
        type: String, 
        required: true, 
    },
    level: { 
        type: Number, 
        min: 1, 
        max: 19, 
        required: true,
        index: true
      },
    wordCount: {
        type: Number,
        min: 1,
        required: true
    },
    totalChapters: {
        type: Number,
        min: 1,
        required: true
    },
    like: {
        type: Number,
        min: 0,
        default: 0
    },
    dislike: {
        type: Number,
        min: 0,
        default: 0
    },
    category: {
        type: [String],
        require: true,
    },
    image: "String",
    collection: {
        type: String,
        enum: ["Folk Tales", "True Story"],
    },
    chapters: [chapterSchema]
}, {
    timestamps: true
})

module.exports = mongoose.model('Story', storySchema);