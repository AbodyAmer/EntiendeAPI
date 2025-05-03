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
}, {
    timestamps: true
})

module.exports = mongoose.model('Essay', essaySchema);