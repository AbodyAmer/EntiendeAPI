// utils/tokens.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const ms = require('ms');

/**
 * Generate a signed JWT access token.
 * @param {string} userId
 * @returns {string} JWT
 */
function generateAccessToken(userId, uuidv4) {
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error('Missing JWT_ACCESS_SECRET in environment');
  }
  return jwt.sign(
    {
      sub: userId,
      aud: 'api.efham.com',
      iss: 'https://api.efham.com',
      jti: uuidv4
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.ACCESS_TTL || '15m'
    }
  );
}

/**
 * Generate an opaque refresh token with ID for lookup and secret for verification.
 * Format: tokenId.tokenSecret (32 chars . 128 chars)
 * @returns {string}
 */
function generateRefreshToken() {
  // Generate token with two parts:
  // 1. Token ID (16 bytes = 32 hex chars) - stored unhashed for efficient lookup
  // 2. Token Secret (64 bytes = 128 hex chars) - only hash is stored
  const tokenId = crypto.randomBytes(16).toString('hex');
  const tokenSecret = crypto.randomBytes(64).toString('hex');
  return `${tokenId}.${tokenSecret}`;
}

/**
 * Set the refresh token in a secure, HttpOnly cookie.
 * @param {import('express').Response} res
 * @param {string} token
 */
function setRefreshCookie(res, token) {
  const ttl = process.env.REFRESH_TTL || '7d';
  const maxAge = typeof ttl === 'string' ? ms(ttl) : Number(ttl);


  res.cookie('rt', token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',    // ensure HTTPS in production
    sameSite: 'Strict',                              // CSRF protection
    domain: process.env.COOKIE_DOMAIN || '.efham.com',
    path: '/',
    maxAge
  });
}

function setTokenCookie(res, token) {
    const ttl = process.env.REFRESH_TTL || '15m';
    const maxAge = typeof ttl === 'string' ? ms(ttl) : Number(ttl);
    res.cookie('token', token, {
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: 'Strict',
        domain: process.env.COOKIE_DOMAIN || '.efham.com',
        path: '/',
        maxAge
    });

}

/**
 * Parse a refresh token into its ID and secret components
 * @param {string} refreshToken 
 * @returns {{tokenId: string, tokenSecret: string} | null}
 */
function parseRefreshToken(refreshToken) {
  if (!refreshToken || typeof refreshToken !== 'string') {
    return null;
  }
  
  const parts = refreshToken.split('.');
  if (parts.length !== 2) {
    // Handle legacy tokens without ID (backward compatibility)
    return {
      tokenId: null,
      tokenSecret: refreshToken
    };
  }
  
  return {
    tokenId: parts[0],
    tokenSecret: parts[1]
  };
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  parseRefreshToken,
  setRefreshCookie,
  setTokenCookie
};
