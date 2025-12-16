/**
 * Token Storage Utility
 * 
 * Responsibility: Provides database-agnostic token storage interface
 * 
 * CURRENT IMPLEMENTATION: In-memory Map (for development/testing)
 * 
 * PRODUCTION MIGRATION:
 * ====================
 * Replace this with database storage (PostgreSQL, MongoDB, Redis, etc.)
 * 
 * Database Schema Example (PostgreSQL):
 * -------------------------------------
 * CREATE TABLE recovery_tokens (
 *   id SERIAL PRIMARY KEY,
 *   user_id VARCHAR(255) NOT NULL,
 *   token_hash VARCHAR(255) NOT NULL UNIQUE,  -- bcrypt hash (60 chars)
 *   created_at TIMESTAMP NOT NULL,
 *   expires_at TIMESTAMP NOT NULL,
 *   used BOOLEAN DEFAULT FALSE,
 *   INDEX idx_user_id (user_id),
 *   INDEX idx_token_hash (token_hash),
 *   INDEX idx_expires_at (expires_at)
 * );
 * 
 * SECURITY CONSIDERATIONS FOR DATABASE:
 * =====================================
 * 
 * 1. INDEX ON token_hash: For fast lookups during validation
 *    - Allows O(1) lookup instead of scanning all tokens
 *    - Critical for performance with many tokens
 * 
 * 2. INDEX ON user_id: For efficient revocation of user tokens
 *    - Allows quick lookup of all tokens for a user
 *    - Useful for revoking tokens on password change
 * 
 * 3. INDEX ON expires_at: For efficient cleanup of expired tokens
 *    - Allows query: DELETE WHERE expires_at < NOW()
 *    - Run cleanup job periodically (cron job)
 * 
 * 4. UNIQUE CONSTRAINT ON token_hash: Prevents hash collisions
 *    - Extremely unlikely with bcrypt, but good practice
 *    - Database-level enforcement of uniqueness
 * 
 * 5. AUTOMATIC CLEANUP: Run periodic cleanup job
 *    - Delete expired tokens daily/weekly
 *    - Prevents database bloat
 *    - Improves query performance
 * 
 * REDIS ALTERNATIVE (Recommended for High Volume):
 * ================================================
 * 
 * Redis structure:
 * - Key: "recovery_token:{hashedToken}"
 * - Value: JSON string of { userId, createdAt, expiresAt, used }
 * - TTL: Set to expiresAt timestamp (automatic expiration)
 * - Benefits: Automatic expiration, fast lookups, in-memory speed
 * 
 * Example Redis implementation:
 * ```javascript
 * const redis = require('redis');
 * const client = redis.createClient();
 * 
 * async function storeToken(hashedToken, data) {
 *   const ttl = Math.floor((data.expiresAt - new Date()) / 1000);
 *   await client.setex(
 *     `recovery_token:${hashedToken}`,
 *     ttl,
 *     JSON.stringify(data)
 *   );
 * }
 * ```
 */

// In-memory storage for development
// In production, replace with database operations
const tokenStore = new Map();

/**
 * Stores a token hash with metadata
 * 
 * @param {string} hashedToken - Bcrypt hashed token
 * @param {Object} data - Token data { userId, createdAt, expiresAt, used }
 */
const storeToken = (hashedToken, data) => {
  tokenStore.set(hashedToken, { ...data });
};

/**
 * Retrieves token data by hash
 * 
 * @param {string} hashedToken - Bcrypt hashed token
 * @returns {Object|null} Token data or null if not found
 */
const getTokenByHash = (hashedToken) => {
  return tokenStore.get(hashedToken) || null;
};

/**
 * Retrieves all tokens for a user
 * 
 * @param {string} userId - User identifier
 * @returns {Array} Array of { hashedToken, data } objects
 */
const getTokensByUserId = (userId) => {
  const tokens = [];
  for (const [hashedToken, data] of tokenStore.entries()) {
    if (data.userId === userId) {
      tokens.push({ hashedToken, data });
    }
  }
  return tokens;
};

/**
 * Deletes a token by hash
 * 
 * @param {string} hashedToken - Bcrypt hashed token
 * @returns {boolean} True if token was deleted, false if not found
 */
const deleteToken = (hashedToken) => {
  return tokenStore.delete(hashedToken);
};

/**
 * Deletes all tokens for a user
 * 
 * @param {string} userId - User identifier
 * @returns {number} Number of tokens deleted
 */
const deleteUserTokens = (userId) => {
  let deleted = 0;
  for (const [hashedToken, data] of tokenStore.entries()) {
    if (data.userId === userId) {
      tokenStore.delete(hashedToken);
      deleted++;
    }
  }
  return deleted;
};

/**
 * Deletes all expired tokens
 * 
 * @returns {number} Number of tokens deleted
 */
const deleteExpiredTokens = () => {
  const now = new Date();
  let deleted = 0;
  for (const [hashedToken, data] of tokenStore.entries()) {
    if (now > data.expiresAt) {
      tokenStore.delete(hashedToken);
      deleted++;
    }
  }
  return deleted;
};

/**
 * Gets all tokens (for statistics/debugging)
 * 
 * @returns {Array} Array of all token entries
 */
const getAllTokens = () => {
  const tokens = [];
  for (const [hashedToken, data] of tokenStore.entries()) {
    tokens.push({ hashedToken, ...data });
  }
  return tokens;
};

/**
 * Gets storage statistics
 * 
 * @returns {Object} Storage statistics
 */
const getStats = () => {
  return {
    total: tokenStore.size,
    // In production, this would query the database
  };
};

module.exports = {
  storeToken,
  getTokenByHash,
  getTokensByUserId,
  deleteToken,
  deleteUserTokens,
  deleteExpiredTokens,
  getAllTokens,
  getStats
};
