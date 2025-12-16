/**
 * Logger Utility
 * 
 * Responsibility: Provides centralized logging functionality for the application.
 * Can be extended to integrate with logging services (Winston, Pino, etc.).
 * 
 * Features:
 * - Different log levels (info, error, warn, debug)
 * - Timestamped logs
 * - Easy to extend with external logging services
 */

const logger = {
  info: (...args) => {
    console.log(`[INFO] ${new Date().toISOString()}`, ...args);
  },

  error: (...args) => {
    console.error(`[ERROR] ${new Date().toISOString()}`, ...args);
  },

  warn: (...args) => {
    console.warn(`[WARN] ${new Date().toISOString()}`, ...args);
  },

  debug: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()}`, ...args);
    }
  }
};

module.exports = logger;
