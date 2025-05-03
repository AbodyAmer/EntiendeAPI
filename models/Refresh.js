// models/Refresh.js
const mongoose = require('mongoose');

const refreshSchema = new mongoose.Schema({
  // Reference to the User
  userId: { 
    type: mongoose.Schema.Types.ObjectId,                // or mongoose.Schema.Types.ObjectId if you use ObjectIds
    ref: 'User', 
    required: true, 
    index: true 
  },

  // Argon2 hash of the opaque refresh token
  tokenHash: { 
    type: String, 
    required: true 
  },

  // JWT ID or random identifier to help detect reuse
  jti: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },

  // Expiration timestamp
  expires: { 
    type: Date, 
    required: true, 
    index: true 
  },

  // Creation metadata
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  createdByIp: { 
    type: String 
  },

  // Revocation info (set when you rotate or invalidate this token)
  revoked: {
    time:      Date,    // when it was revoked
    reason:    String,  // e.g. 'rotated', 'logout', 'compromised'
    replacedBy:String   // jti of the new token (or plain token ID) that replaced this one
  }
}, {
    timestamps: true
});

// Optional: auto-delete expired docs after `expires`
refreshSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Refresh', refreshSchema);
