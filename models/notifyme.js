const mongoose = require('mongoose');

const notifyMeSchema = new mongoose.Schema({
  // Reference to the User
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Level
  level: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  },

  // Dialect
  dialect: {
    type: String,
    enum: ['MSA', 'Egyptian', 'Levantine', 'Gulf', 'Maghrebi']
  },

  // Game
  game: {
    type: String,
    enum: ['Memory', 'WordSearch', 'Crossword', 'Spelling']
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NotifyMe', notifyMeSchema);
