// middleware/requireAuth.js
const jwt = require('jsonwebtoken');
const Refresh = require('../models/Refresh');
const Users = require('../models/User');
const argon2 = require('argon2');
const { v4: uuid } = require('uuid');
const {
  generateAccessToken,
  generateRefreshToken,
  setRefreshCookie,
  setTokenCookie
} = require('./tokens');
const ms = require('ms');

async function requireAuth(req, res, next) {
  try {
    console.time('requireAuth')
    let token;
    
    // First try to get token from cookie (prioritized)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // If not in cookie, try to get from Authorization header as fallback
    else {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    let payload;
    try {
      console.time('jwt.verify')
      payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
        audience: 'api.efham.com',
        issuer: 'https://api.efham.com'
      });
      console.timeEnd('jwt.verify')
    } catch (tokenError) {
      // If token is expired, try to refresh using the refresh token
      if (tokenError.name === 'TokenExpiredError' && req.cookies && req.cookies.rt) {
        return handleTokenRefresh(req, res, next);
      }
      
      // For other token errors, return unauthorized
      return res.status(401).json({ error: 'Invalid token', details: tokenError.message });
    }

    // Ensure the session behind this token is still active
    console.time('Refresh.findOne')
    const session = await Refresh.findOne({
      jti: payload.jti,
      'revoked.time': { $exists: false },
      expires: { $gt: new Date() }
    }).select('jti');
    console.timeEnd('Refresh.findOne')
    
    if (!session) {
      return res.status(401).json({ error: 'Session has been revoked or expired' });
    }

    // Update lastActivity timestamp
    session.lastActivity = new Date();
    session.save();

    // Attach the user ID for downstream handlers
    req.user = payload.sub;
    const isVerified = await Users.findById(payload.sub)
    if (!isVerified.emailVerified) {
      return res.status(401).json({ error: 'User not verified' });
    }
    console.timeEnd('requireAuth')
    next();
  } catch (err) {
    console.error('Error in requireAuth middleware:', err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// Helper function to handle token refresh
async function handleTokenRefresh(req, res, next) {
  try {
    console.log('try to refresh')
    const refreshToken = req.cookies.rt;
    if (!refreshToken) {
      console.log('no refresh token')
      return res.status(401).json({ error: 'Refresh token missing' });
    }

    // Find refresh tokens that aren't revoked and haven't expired
    const refreshSessions = await Refresh.find({
      'revoked.time': { $exists: false },
      expires: { $gt: new Date() }
    });

    // Find the matching token by verifying hashes
    let matchingSession = null;
    let userId = null;

    for (const session of refreshSessions) {
      try {
        const isMatch = await argon2.verify(session.tokenHash, refreshToken);
        if (isMatch) {
          matchingSession = session;
          userId = session.userId;
          break;
        }
      } catch (err) {
        // Continue checking other tokens
        console.log(err)
      }
    }

    if (!matchingSession) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const isVerified = await Users.findById(userId)
    if (!isVerified.emailVerified) {
      return res.status(401).json({ error: 'User not verified' });
    }

    // Generate new tokens
    const jti = uuid();
    const newAccessToken = generateAccessToken(userId, jti);
    const newRefreshToken = generateRefreshToken();

    // Revoke the old refresh token
    matchingSession.revoked = {
      time: new Date(),
      reason: 'rotated',
      replacedBy: jti
    };
    await matchingSession.save();

    // Store the new refresh token
    await Refresh.create({
      userId,
      tokenHash: await argon2.hash(newRefreshToken),
      jti,
      expires: new Date(Date.now() + ms(process.env.REFRESH_TTL || '7d')),
      createdAt: new Date(),
      createdByIp: req.ip
    });

    // Set the new tokens in cookies
    setRefreshCookie(res, newRefreshToken);
    setTokenCookie(res, newAccessToken);

    // Attach the user ID for downstream handlers
    req.user = userId;
    next();
  } catch (err) {
    console.error('Error refreshing token:', err);
    return res.status(401).json({ error: 'Failed to refresh token' });
  }
}

module.exports = requireAuth;