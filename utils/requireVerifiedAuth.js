// middleware/requireAuth.js
const jwt = require('jsonwebtoken');
const Refresh = require('../models/Refresh');
const argon2 = require('argon2');
const { v4: uuid } = require('uuid');
const {
  generateAccessToken,
  generateRefreshToken,
  setRefreshCookie,
  setTokenCookie
} = require('./tokens');
const ms = require('ms');

async function requireVerifiedAuth(req, res, next) {
  try {
    console.time('requireAuth');
    
    // Extract token from cookie or header
    const token = extractAccessToken(req);
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'NO_TOKEN' 
      });
    }
    
    // Verify the access token
    let payload;
    try {
      console.time('jwt.verify');
      payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
        audience: 'api.efham.com',
        issuer: 'https://api.efham.com'
      });
      console.timeEnd('jwt.verify');
    } catch (tokenError) {
      // Only attempt refresh for expired tokens, not malformed ones
      if (tokenError.name === 'TokenExpiredError') {
        // For mobile/API clients, return a specific error code
        // Let them handle refresh through a dedicated endpoint
        return res.status(401).json({ 
          error: 'Token expired',
          code: 'TOKEN_EXPIRED',
          canRefresh: true 
        });
      }
      
      return res.status(401).json({ 
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
        details: tokenError.message 
      });
    }

    // Verify session and user in a single query (more efficient)
    console.time('Session.verify');
    const session = await Refresh.findOne({
      jti: payload.jti,
      userId: payload.sub,
      'revoked.time': { $exists: false },
      expires: { $gt: new Date() }
    })
    .populate('userId', 'emailVerified')
    .lean();
    console.timeEnd('Session.verify');
    
    if (!session) {
      return res.status(401).json({ 
        error: 'Session expired or revoked',
        code: 'SESSION_INVALID' 
      });
    }

    if (!session.userId?.emailVerified) {
      return res.status(403).json({ 
        error: 'Email verification required',
        code: 'EMAIL_NOT_VERIFIED' 
      });
    }

    // Update last activity asynchronously (non-blocking)
    Refresh.updateOne(
      { _id: session._id },
      { lastActivity: new Date() }
    ).exec().catch(err => {
      console.error('Failed to update session activity:', err);
    });

    // Attach user info for downstream handlers
    req.user = payload.sub;
    req.sessionId = payload.jti;
    
    console.timeEnd('requireAuth');
    next();
  } catch (err) {
    console.error('Error in requireAuth middleware:', err);
    return res.status(500).json({ 
      error: 'Authentication error',
      code: 'AUTH_ERROR' 
    });
  }
}

// Separate endpoint for token refresh (recommended approach)
async function refreshToken(req, res) {
  try {
    console.time('refreshToken');
    
    // Get refresh token from cookie or body (for mobile)
    const refreshToken = req.cookies?.rt || req.body?.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ 
        error: 'Refresh token required',
        code: 'NO_REFRESH_TOKEN' 
      });
    }

    // Decode the refresh token to get the JTI (if you store it there)
    // Or use a more efficient lookup strategy
    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, {
        audience: 'api.efham.com',
        issuer: 'https://api.efham.com'
      });
    } catch (err) {
      return res.status(401).json({ 
        error: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN' 
      });
    }

    // Find the refresh session more efficiently
    const session = await Refresh.findOne({
      jti: payload.jti,
      userId: payload.sub,
      'revoked.time': { $exists: false },
      expires: { $gt: new Date() }
    }).populate('userId', 'emailVerified _id');

    if (!session) {
      return res.status(401).json({ 
        error: 'Refresh token expired or revoked',
        code: 'REFRESH_TOKEN_INVALID' 
      });
    }

    // Verify the token hash
    const isValid = await argon2.verify(session.tokenHash, refreshToken);
    if (!isValid) {
      // Possible token theft attempt
      console.warn('Invalid refresh token hash for session:', session.jti);
      
      // Revoke all sessions for this user as a security measure
      await Refresh.updateMany(
        { userId: session.userId._id, 'revoked.time': { $exists: false } },
        { 
          revoked: {
            time: new Date(),
            reason: 'security_breach',
            replacedBy: null
          }
        }
      );
      
      return res.status(401).json({ 
        error: 'Invalid refresh token - all sessions revoked',
        code: 'SECURITY_BREACH' 
      });
    }

    if (!session.userId?.emailVerified) {
      return res.status(403).json({ 
        error: 'Email verification required',
        code: 'EMAIL_NOT_VERIFIED' 
      });
    }

    // Generate new tokens
    const newJti = uuid();
    const newAccessToken = generateAccessToken(session.userId._id, newJti);
    const newRefreshToken = generateRefreshToken();

    // Use a transaction for token rotation (if using MongoDB 4.0+)
    const mongoSession = await mongoose.startSession();
    try {
      await mongoSession.withTransaction(async () => {
        // Revoke old token
        session.revoked = {
          time: new Date(),
          reason: 'rotated',
          replacedBy: newJti
        };
        await session.save({ session: mongoSession });

        // Create new refresh session
        await Refresh.create([{
          userId: session.userId._id,
          tokenHash: await argon2.hash(newRefreshToken),
          jti: newJti,
          expires: new Date(Date.now() + ms(process.env.REFRESH_TTL || '7d')),
          createdAt: new Date(),
          createdByIp: req.ip,
          userAgent: req.get('user-agent'),
          deviceId: req.body?.deviceId // For mobile tracking
        }], { session: mongoSession });
      });
    } finally {
      await mongoSession.endSession();
    }

    // Return tokens based on client type
    const response = {
      accessToken: newAccessToken,
      tokenType: 'Bearer',
      expiresIn: ms(process.env.ACCESS_TTL || '15m') / 1000
    };

    // For web clients, also set cookies
    if (req.cookies?.rt) {
      setRefreshCookie(res, newRefreshToken);
      setTokenCookie(res, newAccessToken);
    } else {
      // For mobile clients, return refresh token in response
      response.refreshToken = newRefreshToken;
    }

    console.timeEnd('refreshToken');
    return res.json(response);
  } catch (err) {
    console.error('Error refreshing token:', err);
    return res.status(500).json({ 
      error: 'Failed to refresh token',
      code: 'REFRESH_ERROR' 
    });
  }
}

// Helper function to extract access token
function extractAccessToken(req) {
  // Prioritize cookie
  if (req.cookies?.token) {
    return req.cookies.token;
  }
  
  // Fallback to Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

module.exports = {
  requireVerifiedAuth,
  refreshToken
};