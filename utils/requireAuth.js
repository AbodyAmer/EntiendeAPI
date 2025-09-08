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

async function requireAuth(req, res, next) {
  try {
    console.log(" why I am running ")
    console.time('requireAuth');
    
    // Extract token from cookie or header
    const token = extractAccessToken(req);
    
    if (!token) {
      console.log('No token provided in request');
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
        console.log('Token expired:', tokenError);
        return res.status(401).json({ 
          error: 'Token expired',
          code: 'TOKEN_EXPIRED',
          canRefresh: true 
        });
      }
      
      console.log('Token verification error:', tokenError);
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
      console.log('No valid session found for token:', payload);
      return res.status(401).json({ 
        error: 'Session expired or revoked',
        code: 'SESSION_INVALID' 
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

module.exports = requireAuth