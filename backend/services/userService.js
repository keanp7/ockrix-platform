const { ValidationError, NotFoundError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Mock User Store Service
 * 
 * ZERO-KNOWLEDGE ARCHITECTURE:
 * ============================
 * 
 * This user store follows zero-knowledge principles:
 * - NO PASSWORDS are stored in this service
 * - Passwords are handled separately (external authentication service)
 * - Only user identifiers and recovery methods are stored
 * 
 * SECURITY BENEFITS:
 * - Even if database is compromised, no password hashes are exposed
 * - Passwords managed by dedicated authentication service (OAuth, Auth0, etc.)
 * - User store can be queried without password access
 * - Recovery methods tracked separately from authentication
 * 
 * DATABASE MIGRATION:
 * See utils/userStorage.js for database schema and migration guide
 */

// In-memory user store (replace with database in production)
// Structure: { userId: { userId, email, phone, recoveryMethods, createdAt, updatedAt } }
const userStore = new Map();

/**
 * User Schema
 * 
 * {
 *   userId: string,              // Unique user identifier
 *   email: string,               // User email address (unique)
 *   phone: string | null,        // User phone number (optional)
 *   recoveryMethods: string[],   // Available recovery methods: ['email', 'phone', 'sms', etc.]
 *   createdAt: Date,             // Account creation timestamp
 *   updatedAt: Date              // Last update timestamp
 * }
 */

/**
 * Creates a new user
 * 
 * SECURITY: No password storage - passwords handled by authentication service
 * 
 * @param {Object} userData - User data { userId, email, phone?, recoveryMethods? }
 * @returns {Promise<Object>} Created user object (without sensitive data)
 */
const createUser = async (userData) => {
  const { userId, email, phone = null, recoveryMethods = ['email'] } = userData;

  // Validation
  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  if (!email || !isValidEmail(email)) {
    throw new ValidationError('Valid email is required');
  }

  // Check if user already exists
  if (userStore.has(userId)) {
    throw new ValidationError('User ID already exists');
  }

  // Check if email is already registered
  const existingUserByEmail = getUserByEmail(email);
  if (existingUserByEmail) {
    throw new ValidationError('Email already registered');
  }

  // Validate recovery methods
  const validRecoveryMethods = ['email', 'phone', 'sms', 'totp'];
  const invalidMethods = recoveryMethods.filter(method => !validRecoveryMethods.includes(method));
  if (invalidMethods.length > 0) {
    throw new ValidationError(`Invalid recovery methods: ${invalidMethods.join(', ')}`);
  }

  // Create user object
  const now = new Date();
  const user = {
    userId,
    email: email.toLowerCase().trim(), // Normalize email
    phone: phone ? normalizePhone(phone) : null,
    recoveryMethods: [...new Set(recoveryMethods)], // Remove duplicates
    createdAt: now,
    updatedAt: now
  };

  // Store user (NO PASSWORD STORED)
  userStore.set(userId, user);

  logger.info(`User created: ${userId} (${email})`);

  // Return user without sensitive data (though we don't store any)
  return {
    userId: user.userId,
    email: user.email,
    phone: user.phone,
    recoveryMethods: user.recoveryMethods,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

/**
 * Gets a user by user ID
 * 
 * @param {string} userId - User identifier
 * @returns {Object|null} User object or null if not found
 */
const getUserById = (userId) => {
  if (!userId) {
    return null;
  }

  const user = userStore.get(userId);
  
  if (!user) {
    return null;
  }

  // Return copy to prevent external modification
  return {
    userId: user.userId,
    email: user.email,
    phone: user.phone,
    recoveryMethods: [...user.recoveryMethods], // Copy array
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

/**
 * Gets a user by email
 * 
 * @param {string} email - Email address
 * @returns {Object|null} User object or null if not found
 */
const getUserByEmail = (email) => {
  if (!email) {
    return null;
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Search through users (in production, this would be an indexed database query)
  for (const user of userStore.values()) {
    if (user.email === normalizedEmail) {
      return {
        userId: user.userId,
        email: user.email,
        phone: user.phone,
        recoveryMethods: [...user.recoveryMethods],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    }
  }

  return null;
};

/**
 * Gets a user by phone number
 * 
 * @param {string} phone - Phone number
 * @returns {Object|null} User object or null if not found
 */
const getUserByPhone = (phone) => {
  if (!phone) {
    return null;
  }

  const normalizedPhone = normalizePhone(phone);

  // Search through users (in production, this would be an indexed database query)
  for (const user of userStore.values()) {
    if (user.phone === normalizedPhone) {
      return {
        userId: user.userId,
        email: user.email,
        phone: user.phone,
        recoveryMethods: [...user.recoveryMethods],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    }
  }

  return null;
};

/**
 * Updates user information
 * 
 * SECURITY: Does not allow updating userId (immutable identifier)
 * 
 * @param {string} userId - User identifier
 * @param {Object} updates - Fields to update { email?, phone?, recoveryMethods? }
 * @returns {Promise<Object>} Updated user object
 */
const updateUser = async (userId, updates) => {
  const user = userStore.get(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Validate updates
  if (updates.email !== undefined) {
    if (!isValidEmail(updates.email)) {
      throw new ValidationError('Invalid email format');
    }
    
    // Check if email is already used by another user
    const existingUserByEmail = getUserByEmail(updates.email);
    if (existingUserByEmail && existingUserByEmail.userId !== userId) {
      throw new ValidationError('Email already registered to another user');
    }
    
    user.email = updates.email.toLowerCase().trim();
  }

  if (updates.phone !== undefined) {
    user.phone = updates.phone ? normalizePhone(updates.phone) : null;
  }

  if (updates.recoveryMethods !== undefined) {
    const validRecoveryMethods = ['email', 'phone', 'sms', 'totp'];
    const invalidMethods = updates.recoveryMethods.filter(method => !validRecoveryMethods.includes(method));
    if (invalidMethods.length > 0) {
      throw new ValidationError(`Invalid recovery methods: ${invalidMethods.join(', ')}`);
    }
    user.recoveryMethods = [...new Set(updates.recoveryMethods)]; // Remove duplicates
  }

  // Update timestamp
  user.updatedAt = new Date();

  // Store updated user
  userStore.set(userId, user);

  logger.info(`User updated: ${userId}`);

  return {
    userId: user.userId,
    email: user.email,
    phone: user.phone,
    recoveryMethods: [...user.recoveryMethods],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

/**
 * Deletes a user
 * 
 * SECURITY: Consider soft delete in production (mark as deleted, don't remove)
 * 
 * @param {string} userId - User identifier
 * @returns {boolean} True if user was deleted, false if not found
 */
const deleteUser = (userId) => {
  if (!userId) {
    return false;
  }

  const deleted = userStore.delete(userId);
  
  if (deleted) {
    logger.info(`User deleted: ${userId}`);
  }

  return deleted;
};

/**
 * Gets all users (for testing/admin purposes)
 * 
 * SECURITY: Limit access to this in production (admin-only)
 * 
 * @returns {Array} Array of user objects
 */
const getAllUsers = () => {
  return Array.from(userStore.values()).map(user => ({
    userId: user.userId,
    email: user.email,
    phone: user.phone,
    recoveryMethods: [...user.recoveryMethods],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }));
};

/**
 * Gets user count
 * 
 * @returns {number} Number of users in store
 */
const getUserCount = () => {
  return userStore.size;
};

/**
 * Checks if a user exists by user ID
 * 
 * @param {string} userId - User identifier
 * @returns {boolean} True if user exists
 */
const userExists = (userId) => {
  return userStore.has(userId);
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validates email format
 * 
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Normalizes phone number format
 * 
 * Removes non-digit characters and formats consistently
 * 
 * @param {string} phone - Phone number to normalize
 * @returns {string} Normalized phone number (digits only)
 */
const normalizePhone = (phone) => {
  if (!phone) {
    return null;
  }

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Basic validation (at least 10 digits)
  if (digits.length < 10) {
    throw new ValidationError('Invalid phone number format');
  }

  return digits;
};

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  getUserByPhone,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserCount,
  userExists
};
