// utils/limiter.js
const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
  // 15 minutes window
  windowMs: 15 * 60 * 1000,
  // limit each IP to 20 requests per windowMs
  max: 1000000,
  // return JSON error
  handler: (req, res, /*next*/) => {
    res.status(429).json({
      error: 'Too many requests, please try again later.'
    });
  },
  // include rate limit info in the `RateLimit-*` headers
  standardHeaders: true,
  // disable the `X-RateLimit-*` headers
  legacyHeaders: false
});
