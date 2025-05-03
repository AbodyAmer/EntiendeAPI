// middleware/requireAuth.js
const jwt     = require('jsonwebtoken');
const Refresh = require('../models/Refresh');

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or malformed' });
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
      audience: 'api.efham.com',
      issuer: 'https://api.efham.com'
    });

    // Ensure the session behind this token is still active
    // (requires that generateAccessToken embedded the refresh-session JTI as payload.sid)
    const session = await Refresh.findOne({
      jti:           payload.jti,
      'revoked.time': { $exists: false },
      expires:       { $gt: new Date() }
    });
    if (!session) {
      return res.status(401).json({ error: 'Session has been revoked or expired' });
    }

    // Attach the user ID for downstream handlers
    req.user = payload.sub;
    next();

  } catch (err) {
    console.error('Error in requireAuth middleware:', err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = requireAuth;
