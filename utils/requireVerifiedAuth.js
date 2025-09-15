// middleware/requireAuth.js
const jwt = require('jsonwebtoken');
const Refresh = require('../models/Refresh');
const argon2 = require('argon2');
const { v4: uuid } = require('uuid');
const {
  generateAccessToken,
  generateRefreshToken,
  parseRefreshToken,
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

    // if (!session.userId?.emailVerified) {
    //   return res.status(403).json({ 
    //     error: 'Email verification required',
    //     code: 'EMAIL_NOT_VERIFIED' 
    //   });
    // }

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
    console.log("Refresh token request received");
    
    // Get refresh token from cookie or body (for mobile)
    const refreshToken = req.cookies?.rt || req.body?.refreshToken;

    console.log("Using refresh token:", refreshToken)
    
    if (!refreshToken) {
      return res.status(401).json({ 
        error: 'Refresh token required',
        code: 'NO_REFRESH_TOKEN' 
      });
    }

    // Parse the refresh token to extract ID and secret
    const parsed = parseRefreshToken(refreshToken);
    if (!parsed) {
      return res.status(401).json({ 
        error: 'Invalid refresh token format',
        code: 'INVALID_TOKEN_FORMAT' 
      });
    }

    const { tokenId, tokenSecret } = parsed;

    let validSession;
    
    if (tokenId) {
      // New format: efficient lookup by tokenId
      validSession = await Refresh.findOne({
        tokenId,
        'revoked.time': { $exists: false },
        expires: { $gt: new Date() }
      }).populate('userId', 'emailVerified _id');
      
      if (validSession) {
        // Verify the token secret
        const isValid = await argon2.verify(validSession.tokenHash, tokenSecret);
        if (!isValid) {
          // Token theft attempt - revoke all user sessions
          console.warn('Invalid token secret for tokenId:', tokenId);
          await Refresh.updateMany(
            { userId: validSession.userId._id, 'revoked.time': { $exists: false } },
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
      }
    } else {
      // Legacy format: fallback to slow hash checking (for backward compatibility)
      console.log('Using legacy refresh token format - consider migrating');
      const sessions = await Refresh.find({
        tokenId: { $exists: false }, // Only check legacy tokens
        'revoked.time': { $exists: false },
        expires: { $gt: new Date() }
      }).populate('userId', 'emailVerified _id');
      
      for (const session of sessions) {
        try {
          const isValid = await argon2.verify(session.tokenHash, tokenSecret);
          if (isValid) {
            validSession = session;
            break;
          }
        } catch (err) {
          continue;
        }
      }
    }

    if (!validSession) {
      return res.status(401).json({ 
        error: 'Invalid or expired refresh token',
        code: 'REFRESH_TOKEN_INVALID' 
      });
    }

    // Generate new tokens
    const newJti = uuid();
    const newAccessToken = generateAccessToken(validSession.userId._id, newJti);
    const newRefreshToken = generateRefreshToken();
    const newParsed = parseRefreshToken(newRefreshToken);

    // Revoke old token and create new refresh session
    await Refresh.findByIdAndUpdate(validSession._id, {
      revoked: {
        time: new Date(),
        reason: 'rotated',
        replacedBy: newJti
      }
    });

    // Create new refresh session with tokenId for efficient lookup
    await Refresh.create({
      userId: validSession.userId._id,
      tokenId: newParsed.tokenId, // Store for efficient lookup
      tokenHash: await argon2.hash(newParsed.tokenSecret), // Only hash the secret
      jti: newJti,
      expires: new Date(Date.now() + ms(process.env.REFRESH_TTL || '7d')),
      createdAt: new Date(),
      createdByIp: req.ip,
      deviceInfo: {
        clientType: req.clientType,
        isNativeApp: req.clientInfo?.isNativeApp,
        deviceType: req.clientInfo?.deviceType,
        deviceModel: req.clientInfo?.deviceModel,
        deviceVendor: req.clientInfo?.deviceVendor,
        osName: req.clientInfo?.osName,
        osVersion: req.clientInfo?.osVersion,
        userAgent: req.clientInfo?.userAgent
      }
    });

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

    console.log(`Refresh token successful for user ${validSession.userId._id}`);
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