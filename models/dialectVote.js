const mongoose = require('mongoose');
const { dialects } = require('../utils/enums');

const dialectVoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  dialect: {
    type: String,
    enum: dialects,
    required: true
  }
}, {
  timestamps: true
});

// Create a compound unique index on user and dialect
dialectVoteSchema.index({ user: 1, dialect: 1 }, { unique: true });

module.exports = mongoose.model('DialectVote', dialectVoteSchema);

