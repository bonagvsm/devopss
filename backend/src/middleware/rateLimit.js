const rateLimit = require('express-rate-limit');
const config = require('../config');
const { AppError } = require('../errors');

const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.max,
  standardHeaders: 'draft-7', // header RateLimit-* standar
  legacyHeaders: false,
  // Lewat errorHandler agar format error 429 sama dengan error lain.
  handler: (_req, _res, next) =>
    next(new AppError(429, 'RATE_LIMITED', 'Too many requests, please try again later')),
});

module.exports = { apiLimiter };
