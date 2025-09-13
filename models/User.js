// models/User.js
const mongoose = require('mongoose');
const { dialects } = require('../utils/enums')

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  hash: {
    // argon2 hash of the user's password
    type: String,
    required: false
  },
  googleId: {
    type: String,
    sparse: true,
    index: true
  },
  authProvider: {
    type: String,
    default: 'local'
  },
  emailVerified: { 
    type: Boolean, 
    default: false 
  },
  verificationToken: {
    type: String,
    default: null
  },
  verificationExpires: {
    type: Date,
    default: null
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },

  // ——————————————————————————————
  // Efham-specific profile fields
  // ——————————————————————————————

  // User’s current reading-level 1–19 (CEFR-aligned)
  level: { 
    type: Number, 
    min: 1, 
    max: 19, 
    default: 6 
  },

  // Default dialect for content & audio
  defaultDialect: { 
    type: String, 
    enum: dialects, 
    default: dialects[0]
  },
  currentEssay: {
    type: mongoose.Schema.Types.ObjectId,                // or mongoose.Schema.Types.ObjectId if you use ObjectIds
    ref: 'Essay', 
  }
}, {
    timestamps: true
 });


// Export the model
module.exports = mongoose.model('User', userSchema);
