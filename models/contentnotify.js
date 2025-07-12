const mongoose = require('mongoose');

const contentNotifySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    level: {
        type: String,
        required: true,
        enum: ['A1','B2', 'C1', 'C2']
    }
}, {
    timestamps: true
});

// Create compound unique index for userId, notifyType, and remark
contentNotifySchema.index({ userId: 1, level: 1 }, { unique: true });

const ContentNotify = mongoose.model('ContentNotify', contentNotifySchema);

module.exports = ContentNotify;
