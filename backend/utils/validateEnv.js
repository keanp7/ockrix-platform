/**
 * Environment Variables Validation Utility
 * 
 * Responsibility: Validates all required environment variables at application startup
 * and enforces security best practices.
 * 
 * Security Features:
 * - Ensures required variables are present
 * - Validates JWT_SECRET strength
 * - Validates numeric ranges
 * - Provides clear error messages
 */

const logger = require('./logger');

/**
 * Validates all required environment variables
 * Should be called at application startup (in server.js)
 */
const validateEnv = () => {
  const errors = [];

  // Required environment variables
  const requiredVars = {
    PORT: {
      required: false, // Has default
      validator: (value) => {
        const port = parseInt(value || 3000);
        if (isNaN(port) || port < 1 || port > 65535) {
          return 'PORT must be a number between 1 and 65535';
        }
        return null;
      }
    },
    JWT_SECRET: {
      required: true,
      validator: (value) => {
        if (!value || value.trim() === '') {
          return 'JWT_SECRET is required';
        }
        if (value.length < 32) {
          return 'JWT_SECRET must be at least 32 characters long (64+ recommended for production)';
        }
        // Check if it's a default/example value
        const defaultValues = [
          'your-super-secret-jwt-key',
          'secret',
          'change-this',
          'example-secret'
        ];
        if (defaultValues.some(def => value.toLowerCase().includes(def))) {
          return 'JWT_SECRET appears to be a default/example value. Please use a strong, random secret.';
        }
        return null;
      }
    },
    TOKEN_EXPIRY_MINUTES: {
      required: false, // Has default
      validator: (value) => {
        const minutes = parseInt(value || 60);
        if (isNaN(minutes) || minutes < 1 || minutes > 525600) {
          return 'TOKEN_EXPIRY_MINUTES must be between 1 and 525600 (1 year)';
        }
        // Warn if expiry is very long
        if (minutes > 1440) { // More than 24 hours
          logger.warn(`TOKEN_EXPIRY_MINUTES is set to ${minutes} minutes (${Math.round(minutes/60)} hours). Consider using shorter expiry with refresh tokens for better security.`);
        }
        return null;
      }
    },
    RATE_LIMIT_WINDOW: {
      required: false, // Has default
      validator: (value) => {
        const window = parseInt(value || 900000);
        if (isNaN(window) || window < 1000) {
          return 'RATE_LIMIT_WINDOW must be at least 1000 milliseconds (1 second)';
        }
        return null;
      }
    },
    RATE_LIMIT_MAX: {
      required: false, // Has default
      validator: (value) => {
        const max = parseInt(value || 100);
        if (isNaN(max) || max < 1) {
          return 'RATE_LIMIT_MAX must be at least 1';
        }
        if (max > 10000) {
          logger.warn(`RATE_LIMIT_MAX is set to ${max}, which is very high. Ensure this is intentional.`);
        }
        return null;
      }
    }
  };

  // Validate each variable
  Object.entries(requiredVars).forEach(([varName, config]) => {
    const value = process.env[varName];
    
    // Check if required
    if (config.required && (!value || value.trim() === '')) {
      errors.push(`Missing required environment variable: ${varName}`);
      return;
    }

    // Run validator if value exists
    if (value && config.validator) {
      const error = config.validator(value);
      if (error) {
        errors.push(`${varName}: ${error}`);
      }
    }
  });

  // If errors found, throw
  if (errors.length > 0) {
    logger.error('Environment variable validation failed:');
    errors.forEach(error => logger.error(`  - ${error}`));
    throw new Error('Environment variable validation failed. Please check your .env file.');
  }

  logger.info('✅ Environment variables validated successfully');
  
  // Log security recommendations in development
  if (process.env.NODE_ENV === 'development') {
    logger.warn('⚠️  Running in DEVELOPMENT mode. Ensure NODE_ENV=production in production.');
    
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 64) {
      logger.warn('⚠️  JWT_SECRET is less than 64 characters. Consider using a longer secret for production.');
    }
  }
};

module.exports = { validateEnv };
