const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 1000
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: false
    },

}, { timestamps: true });


module.exports = mongoose.model('Feedback', feedbackSchema);

