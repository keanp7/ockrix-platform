const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * Rate Limiting Middleware
 * 
 * Responsibility: Protects API endpoints from brute-force attacks and abuse
 * by limiting the number of requests from a single IP address.
 * 
 * SECURITY FEATURES:
 * - IP-based rate limiting (prevents brute-force attacks)
 * - Different limits for different endpoint types
 * - Clear error messages
 * - Rate limit headers in responses
 * - Trust proxy support (works behind reverse proxies)
 * 
 * CONFIGURATION:
 * - windowMs: Time window in milliseconds
 * - max: Maximum number of requests per window
 * - message: Error message when limit exceeded
 * - standardHeaders: Include rate limit headers (X-RateLimit-*)
 * - legacyHeaders: Include Retry-After header
 */

// Get rate limit configuration from environment variables
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000; // 15 minutes default
const RATE_LIMIT_MAX_GENERAL = parseInt(process.env.RATE_LIMIT_MAX) || 100; // General limit default

/**
 * Base rate limiter configuration
 */
const createRateLimiter = (options) => {
  const {
    windowMs = RATE_LIMIT_WINDOW,
    max = RATE_LIMIT_MAX_GENERAL,
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message,
      retryAfter: Math.ceil(windowMs / 1000) // Retry after in seconds
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers (use standard headers)
    
    // Trust proxy for accurate IP addresses (important when behind reverse proxy)
    // This respects req.ip which is set by app.set('trust proxy', 1)
    
    // Handler for when rate limit is exceeded
    handler: (req, res) => {
      const retryAfter = Math.ceil(windowMs / 1000);
      
      // Log rate limit exceeded for security monitoring
      logger.warn('Rate limit exceeded', {
        ip: req.ip || req.connection.remoteAddress,
        path: req.path,
        method: req.method,
        userAgent: req.get('user-agent'),
        timestamp: new Date().toISOString()
      });

      res.status(429).json({
        success: false,
        error: message,
        retryAfter, // Seconds until limit resets
        limit: max,
        window: Math.ceil(windowMs / 1000) // Window in seconds
      });
    },
    
    // Skip successful requests (only count failures)
    skipSuccessfulRequests,
    
    // Skip failed requests (only count successes)
    skipFailedRequests,
    
    // Key generator: Use IP address (default)
    // Can be customized to use userId if authenticated
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress || 'unknown';
    }
  });
};

/**
 * Strict rate limiter for recovery endpoints
 * 
 * More restrictive limits to prevent brute-force attacks on recovery flows
 * 
 * Configuration:
 * - Window: 15 minutes
 * - Max requests: 5 per 15 minutes
 * - Prevents rapid recovery attempts
 */
const recoveryRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: 'Too many recovery attempts. Please wait 15 minutes before trying again.',
  skipSuccessfulRequests: false, // Count all requests (successful or not)
  skipFailedRequests: false
});

/**
 * Moderate rate limiter for verification endpoint
 * 
 * Less strict than recovery start, but still protected
 * 
 * Configuration:
 * - Window: 15 minutes
 * - Max requests: 10 per 15 minutes
 */
const verificationRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes
  message: 'Too many verification attempts. Please wait before trying again.',
  skipSuccessfulRequests: false
});

/**
 * Standard rate limiter for token validation/complete endpoints
 * 
 * Configuration:
 * - Window: 15 minutes
 * - Max requests: 20 per 15 minutes
 */
const tokenOperationRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per 15 minutes
  message: 'Too many token operations. Please wait before trying again.',
  skipSuccessfulRequests: false
});

/**
 * Very strict rate limiter for sensitive operations
 * 
 * Use for endpoints that should have very limited access
 * 
 * Configuration:
 * - Window: 1 hour
 * - Max requests: 3 per hour
 */
const strictRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: 'Too many requests. Please wait 1 hour before trying again.',
  skipSuccessfulRequests: false
});

/**
 * General API rate limiter
 * 
 * For general API endpoints
 * 
 * Configuration:
 * - Window: 15 minutes
 * - Max requests: 100 per 15 minutes
 */
const generalRateLimiter = createRateLimiter({
  windowMs: RATE_LIMIT_WINDOW,
  max: RATE_LIMIT_MAX_GENERAL,
  message: 'Too many requests. Please try again later.'
});

/**
 * Rate limiter that counts only failed requests
 * 
 * Useful for login/authentication endpoints where you want to allow
 * many attempts but limit failures
 * 
 * Configuration:
 * - Window: 15 minutes
 * - Max failures: 10 per 15 minutes
 */
const failureBasedRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 failed requests per 15 minutes
  message: 'Too many failed attempts. Please wait before trying again.',
  skipSuccessfulRequests: true, // Only count failures
  skipFailedRequests: false
});

/**
 * Custom rate limiter factory
 * 
 * Create custom rate limiters with specific configurations
 * 
 * @param {Object} config - Rate limiter configuration
 * @returns {Function} Rate limiter middleware
 */
const createCustomRateLimiter = (config) => {
  return createRateLimiter(config);
};

module.exports = {
  // Pre-configured rate limiters
  recoveryRateLimiter,          // Very strict: 5 req/15min - for recovery start
  verificationRateLimiter,      // Moderate: 10 req/15min - for verification
  tokenOperationRateLimiter,    // Standard: 20 req/15min - for token operations
  strictRateLimiter,            // Very strict: 3 req/hour - for sensitive ops
  generalRateLimiter,           // General: 100 req/15min - for general API
  failureBasedRateLimiter,      // Failure-based: 10 failures/15min
  
  // Factory function
  createCustomRateLimiter,
  
  // Base function for advanced usage
  createRateLimiter
};
