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
 * Generate an opaque refresh token (random string).
 * @returns {string}
 */
function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex'); // 128 chars
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
    path: '/auth/refresh-token',
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

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  setRefreshCookie,
  setTokenCookie
};
