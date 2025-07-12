const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReadHistorySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  essayId: {
    type: Schema.Types.ObjectId,
    ref: 'Essay',
    required: true
  },
  level: {
    type: Number,
    required: true
  },
  readAt: {
    type: Date,
    default: Date.now
  },
  ended: {
    type: Boolean,
    default: false
  },
  like: {
    type: Boolean,
    default: false
  },
  dislike: {
    type: Boolean,
    default: false
  },
  answers: {
    type: [Object],
    default: []
  }
});

module.exports = mongoose.model('ReadHistory', ReadHistorySchema);
