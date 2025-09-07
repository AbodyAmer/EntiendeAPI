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

  // Token ID for efficient lookup (first part of token, stored unhashed)
  tokenId: { 
    type: String, 
    sparse: true, // Sparse index for backward compatibility with legacy tokens
    index: true   // Index for O(1) lookups instead of O(n) hash checking
  },

  // Argon2 hash of the token secret (second part of token)
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
  },

  // Creation metadata
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  createdByIp: { 
    type: String 
  },

  // Device information from clientDetector
  deviceInfo: {
    clientType: { 
      type: String, 
      enum: ['mobile-app', 'mobile-web', 'desktop-web'],
      default: 'desktop-web'
    },
    isNativeApp: { 
      type: Boolean, 
      default: false 
    },
    deviceType: { 
      type: String, 
      default: 'unknown' 
    },
    deviceModel: { 
      type: String, 
      default: 'unknown' 
    },
    deviceVendor: { 
      type: String, 
      default: 'unknown' 
    },
    osName: { 
      type: String, 
      default: 'unknown' 
    },
    osVersion: { 
      type: String, 
      default: 'unknown' 
    },
    userAgent: { 
      type: String, 
      default: 'unknown' 
    }
  },
   // Last activity timestamp
   lastActivity: {
    type: Date,
    default: Date.now,
    index: true
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

refreshSchema.index({ 'revoked.time': 1 });
// Optional: auto-delete expired docs after `expires`
refreshSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });


module.exports = mongoose.model('Refresh', refreshSchema);
