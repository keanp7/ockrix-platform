/**
 * Recovery Token Service
 * 
 * Responsibility: Manages zero-knowledge recovery tokens for account recovery
 * 
 * SECURITY FEATURES:
 * ==================
 * - Cryptographically secure token generation (crypto.randomBytes)
 * - Token hashing before storage (bcrypt, cost factor 12)
 * - Single-use enforcement (tokens marked as used after validation)
 * - Time-limited tokens (10-minute expiration)
 * - Zero-knowledge design (never stores plain tokens)
 * - Constant-time comparison (prevents timing attacks)
 */

const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { ValidationError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");
const tokenStorage = require("../utils/tokenStorage");
const userService = require("./userService");

/**
 * Token expiration time (10 minutes)
 * SECURITY: Short expiration reduces attack window
 */
const TOKEN_EXPIRY_MINUTES = 10;
const TOKEN_EXPIRY_MS = TOKEN_EXPIRY_MINUTES * 60 * 1000;

/**
 * Session storage for recovery attempts (in-memory)
 * Structure: { sessionId: { sessionId, userId, identifier, requestMethod, clientIp, createdAt, tokenHash, used } }
 * 
 * PRODUCTION: Replace with database storage
 */
const sessions = {}; // sessionId -> session data
const tokenToSession = {}; // hashedToken -> sessionId (for lookup)

/**
 * Generates a cryptographically secure recovery token
 * 
 * SECURITY: Uses crypto.randomBytes (CSPRNG) for secure randomness
 * 32 bytes = 256 bits = 2^256 possible values (computationally infeasible to guess)
 * 
 * @returns {string} Base64url-encoded token (URL-safe)
 */
const generateToken = () => {
  const randomBytes = crypto.randomBytes(32); // 256 bits
  return randomBytes.toString("base64url");
};

/**
 * Creates a new recovery session
 * 
 * SECURITY: Token is hashed before storage (zero-knowledge design)
 * 
 * @param {string} email - User email address
 * @returns {Promise<string>} Session token (plain token to send to user)
 */
const createSession = async (email) => {
  if (!email || typeof email !== "string") {
    throw new ValidationError("Email is required");
  }

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError("Invalid email format");
  }

  // Generate cryptographically secure token
  const token = generateToken();

  // SECURITY: Hash token before storage (zero-knowledge design)
  // bcrypt automatically generates unique salt and applies key stretching
  const hashedToken = await bcrypt.hash(token, 12);

  // Create session data
  const sessionId = uuidv4();
  const createdAt = Date.now();
  const expiresAt = createdAt + TOKEN_EXPIRY_MS;

  sessions[sessionId] = {
    email,
    hashedToken,
    createdAt,
    expiresAt,
    used: false
  };

  // Map token hash to session for lookup
  tokenToSession[hashedToken] = sessionId;

  // Also store in tokenStorage for consistency with existing code
  tokenStorage.storeToken(hashedToken, {
    userId: email, // Using email as userId for simplicity
    createdAt: new Date(createdAt),
    expiresAt: new Date(expiresAt),
    used: false
  });

  logger.info(`Recovery session created for: ${email}`, {
    sessionId,
    createdAt: new Date(createdAt).toISOString()
  });

  // Return plain token (send to user, then discard from memory)
  return token;
};

/**
 * Verifies a recovery session token
 * 
 * SECURITY:
 * - Uses bcrypt.compare for constant-time comparison (prevents timing attacks)
 * - Checks expiration
 * - Enforces single-use (marks as used)
 * 
 * @param {string} token - Plain recovery token from user
 * @returns {Promise<string|null>} User email if valid, null if invalid/expired
 */
const verifySession = async (token) => {
  if (!token || typeof token !== "string") {
    return null;
  }

  // Find session by comparing token hash
  // Since we only store hashes, we must check all sessions
  let sessionId = null;
  let session = null;

  for (const [sid, sess] of Object.entries(sessions)) {
    // SECURITY: Constant-time comparison prevents timing attacks
    const isMatch = await bcrypt.compare(token, sess.hashedToken);
    if (isMatch) {
      sessionId = sid;
      session = sess;
      break;
    }
  }

  if (!session) {
    logger.warn("Token verification failed: token not found");
    return null; // Invalid token
  }

  // Check expiration (10 minutes)
  const now = Date.now();
  const age = now - session.createdAt;
  
  if (age >= TOKEN_EXPIRY_MS) {
    logger.warn("Token verification failed: token expired", {
      email: session.email,
      age: Math.floor(age / 1000) + " seconds"
    });
    // Clean up expired session
    removeSession(sessionId);
    return null; // Expired
  }

  // Check if already used (single-use enforcement)
  if (session.used) {
    logger.warn("Token verification failed: token already used", {
      email: session.email
    });
    return null; // Already used
  }

  // SECURITY: Mark as used BEFORE returning (prevents race conditions)
  session.used = true;
  sessions[sessionId].used = true;

  // Also mark in tokenStorage
  const tokenData = tokenStorage.getTokenByHash(session.hashedToken);
  if (tokenData) {
    tokenData.used = true;
    tokenStorage.storeToken(session.hashedToken, tokenData);
  }

  logger.info("Token verification successful", {
    email: session.email,
    sessionId
  });

  // Return user email
  return session.email;
};

/**
 * Removes a session (cleanup)
 * 
 * @param {string} sessionId - Session identifier
 * @returns {boolean} True if session was removed, false if not found
 */
const removeSession = (sessionId) => {
  if (!sessionId || !sessions[sessionId]) {
    return false;
  }

  const session = sessions[sessionId];
  
  // Remove from token hash mapping
  if (session.hashedToken && tokenToSession[session.hashedToken]) {
    delete tokenToSession[session.hashedToken];
  }

  // Remove from tokenStorage
  if (session.hashedToken) {
    tokenStorage.deleteToken(session.hashedToken);
  }

  // Remove session
  delete sessions[sessionId];

  return true;
};

/**
 * Cleans up expired sessions
 * 
 * @returns {number} Number of sessions removed
 */
const cleanupExpiredSessions = () => {
  const now = Date.now();
  let removed = 0;

  for (const [sessionId, session] of Object.entries(sessions)) {
    if (now >= session.expiresAt) {
      removeSession(sessionId);
      removed++;
    }
  }

  // Also cleanup tokenStorage
  tokenStorage.deleteExpiredTokens();

  return removed;
};

// ============================================================================
// BACKWARD COMPATIBILITY: Keep existing functions for current codebase
// ============================================================================

/**
 * Creates a recovery token for a user (backward compatibility)
 * 
 * @param {string} userId - User identifier
 * @returns {Promise<{token: string, expiresAt: Date}>}
 */
const createRecoveryToken = async (userId) => {
  // Use createSession but return in expected format
  const token = await createSession(userId);
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);
  
  return {
    token,
    expiresAt
  };
};

/**
 * Validates a recovery token (backward compatibility)
 * 
 * @param {string} token - Plain recovery token
 * @returns {Promise<{userId: string|null, isValid: boolean}>}
 */
const validateRecoveryToken = async (token) => {
  const email = await verifySession(token);
  
  return {
    userId: email,
    isValid: !!email
  };
};

/**
 * Starts a recovery process (backward compatibility)
 * 
 * @param {Object} params - { email?, phone?, clientIp? }
 * @returns {Promise<Object>} Session data
 */
const startRecovery = async ({ email, phone, clientIp }) => {
  if (!email && !phone) {
    throw new ValidationError("Either email or phone is required");
  }

  if (email && phone) {
    throw new ValidationError("Provide either email or phone, not both");
  }

  const identifier = email || phone;
  const requestMethod = email ? "email" : "phone";

  // Validate format
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError("Invalid email format");
  }

  if (phone && !/^\+?[1-9]\d{1,14}$/.test(phone.replace(/\s/g, ""))) {
    throw new ValidationError("Invalid phone format");
  }

  // Look up user
  let user = null;
  try {
    if (email) {
      user = userService.getUserByEmail(email);
    } else {
      user = userService.getUserByPhone(phone);
    }
  } catch (error) {
    user = null;
  }

  // Create session token (only if user exists, but don't reveal)
  let token = null;
  let sessionId = null;
  let expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

  if (user) {
    token = await createSession(email || phone);
    
    // Find sessionId for the token
    for (const [sid, session] of Object.entries(sessions)) {
      const isMatch = await bcrypt.compare(token, session.hashedToken);
      if (isMatch) {
        sessionId = sid;
        expiresAt = new Date(session.expiresAt);
        break;
      }
    }
  } else {
    // Create a dummy sessionId to prevent enumeration
    sessionId = uuidv4();
    sessions[sessionId] = {
      email: identifier,
      hashedToken: null,
      createdAt: Date.now(),
      expiresAt: Date.now() + TOKEN_EXPIRY_MS,
      used: false
    };
  }

  // SECURITY: Always return same response format (prevents user enumeration)
  return {
    sessionId,
    expiresAt,
    userId: user ? user.userId : undefined,
    userExists: !!user,
    identifier,
    requestMethod
  };
};

/**
 * Gets session data by session ID (backward compatibility)
 * 
 * @param {string} sessionId - Session identifier
 * @returns {Object|null} Session data
 */
const getSessionData = (sessionId) => {
  if (!sessionId || !sessions[sessionId]) {
    return null;
  }

  const session = sessions[sessionId];
  return {
    sessionId,
    userId: session.email,
    identifier: session.email,
    requestMethod: "email",
    clientIp: "unknown",
    createdAt: new Date(session.createdAt),
    tokenHash: session.hashedToken,
    used: session.used
  };
};

/**
 * Completes recovery (backward compatibility)
 * 
 * @param {string} token - Recovery token
 * @returns {Promise<Object>} Completion result
 */
const completeRecovery = async (token) => {
  const email = await verifySession(token);

  if (!email) {
    return {
      success: false,
      error: "Invalid or expired recovery token"
    };
  }

  // Find session
  let sessionId = null;
  for (const [sid, session] of Object.entries(sessions)) {
    if (session.email === email) {
      sessionId = sid;
      break;
    }
  }

  const confirmationId = uuidv4();
  const completedAt = new Date();

  return {
    success: true,
    userId: email,
    sessionId,
    confirmationId,
    completedAt
  };
};

/**
 * Revokes all tokens for a user (backward compatibility)
 * 
 * @param {string} userId - User identifier
 * @returns {number} Number of tokens revoked
 */
const revokeUserTokens = (userId) => {
  let revoked = 0;

  for (const [sessionId, session] of Object.entries(sessions)) {
    if (session.email === userId) {
      removeSession(sessionId);
      revoked++;
    }
  }

  return revoked;
};

/**
 * Gets token statistics (backward compatibility)
 * 
 * @returns {Object} Statistics
 */
const getTokenStats = () => {
  const now = Date.now();
  const stats = {
    total: Object.keys(sessions).length,
    active: 0,
    used: 0,
    expired: 0
  };

  for (const session of Object.values(sessions)) {
    if (session.used) {
      stats.used++;
    } else if (now >= session.expiresAt) {
      stats.expired++;
    } else {
      stats.active++;
    }
  }

  return stats;
};

/**
 * Cleans up expired tokens (backward compatibility)
 * 
 * @returns {number} Number of tokens deleted
 */
const cleanupExpiredTokens = () => {
  return cleanupExpiredSessions();
};

module.exports = {
  // Simplified API (your style)
  createSession,
  verifySession,
  removeSession,
  cleanupExpiredSessions,

  // Backward compatibility (existing codebase)
  generateToken,
  createRecoveryToken,
  validateRecoveryToken,
  startRecovery,
  getSessionData,
  completeRecovery,
  revokeUserTokens,
  getTokenStats,
  cleanupExpiredTokens
};
