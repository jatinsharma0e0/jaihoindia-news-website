const rateLimit = require('express-rate-limit');

/**
 * General rate limiter for all API routes.
 * 100 requests per 15 minutes.
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes',
    },
});

/**
 * Stricter rate limiter for auth-related routes (login, admin tasks).
 * 20 requests per 15 minutes.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many login/auth attempts, please try again after 15 minutes',
    },
});

/**
 * Strict rate limiter for the /refresh-cache endpoint.
 * UptimeRobot calls every 3 hours = max 8/day.
 * Allow max 5 per hour as a safety buffer.
 */
const cacheRefreshLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many cache refresh requests. Max 5 per hour allowed.',
    },
});

module.exports = {
    apiLimiter,
    authLimiter,
    cacheRefreshLimiter,
};
