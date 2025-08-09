const mongoose = require('mongoose');

const essaySchema = new mongoose.Schema({
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
    contentType: {
        type: String,
        required: true,
        enum: ["STANDARD", "PREMIUM"]
    },
    category: {
        type: [String],
        require: true,
    },
    image: "String",
    collection: {
        type: String,
        enum: ["Folk Tales", "True Story"],
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Essay', essaySchema);