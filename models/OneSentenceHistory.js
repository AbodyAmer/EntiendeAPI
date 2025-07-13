const mongoose = require('mongoose');

const oneSentenceHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sentence: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'OneSentenceChallenge'
  },
  isCorrect: {
    type: Boolean,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('OneSentenceHistory', oneSentenceHistorySchema);