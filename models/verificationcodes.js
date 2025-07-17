const mongoose = require('mongoose');
const { Schema } = mongoose;

const verificationCodeSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    code: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600 // 60 minutes in seconds
    }
})

module.exports = mongoose.model('VerificationCode', verificationCodeSchema);