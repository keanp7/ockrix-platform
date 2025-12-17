/**
 * Authentication Service
 * 
 * Handles user registration, login, and password management
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../prisma/client');
const { ValidationError, AuthenticationError, NotFoundError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY_MINUTES || '60';
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

/**
 * Register a new user
 */
const register = async ({ email, password, name, phone, language = 'en' }) => {
  // Validate input
  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError('Invalid email format');
  }

  if (password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters');
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new ValidationError('Email already registered');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      name: name || null,
      phone: phone || null,
      language,
      subscription: {
        create: {
          planId: 'FREE',
          planName: 'Free',
          stripeStatus: 'active',
          status: 'active',
          totalRecoveryLimit: 2, // FREE plan limit
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      language: true,
      createdAt: true,
    },
  });

  logger.info('User registered', { userId: user.id, email: user.email });

  // Generate tokens
  const { accessToken, refreshToken } = await generateTokens(user.id);

  return {
    user,
    accessToken,
    refreshToken,
  };
};

/**
 * Login user
 */
const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Verify password
  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValid) {
    throw new AuthenticationError('Invalid email or password');
  }

  logger.info('User logged in', { userId: user.id, email: user.email });

  // Generate tokens
  const { accessToken, refreshToken } = await generateTokens(user.id);

  // Create session
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await prisma.session.create({
    data: {
      userId: user.id,
      token: accessToken,
      refreshToken,
      expiresAt,
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      language: user.language,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * Generate JWT tokens
 */
const generateTokens = async (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    JWT_SECRET,
    { expiresIn: `${JWT_EXPIRY}m` }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d` }
  );

  return { accessToken, refreshToken };
};

/**
 * Verify JWT token
 */
const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new AuthenticationError('Invalid or expired token');
  }
};

/**
 * Refresh access token
 */
const refreshAccessToken = async (refreshToken) => {
  const decoded = await verifyToken(refreshToken);
  
  if (decoded.type !== 'refresh') {
    throw new AuthenticationError('Invalid token type');
  }

  // Check if session exists
  const session = await prisma.session.findFirst({
    where: {
      userId: decoded.userId,
      refreshToken,
      revokedAt: null,
      expiresAt: {
        gte: new Date(),
      },
    },
  });

  if (!session) {
    throw new AuthenticationError('Refresh token not found or expired');
  }

  // Generate new access token
  const { accessToken } = await generateTokens(decoded.userId);

  // Update session
  await prisma.session.update({
    where: { id: session.id },
    data: { token: accessToken },
  });

  return { accessToken };
};

/**
 * Reset password using recovery token
 */
const resetPassword = async ({ token, newPassword }) => {
  if (!token || !newPassword) {
    throw new ValidationError('Token and new password are required');
  }

  if (newPassword.length < 8) {
    throw new ValidationError('Password must be at least 8 characters');
  }

  // Use recovery token service to validate token
  const recoveryTokenService = require('./recoveryTokenService');
  const email = await recoveryTokenService.verifySession(token);

  if (!email) {
    throw new ValidationError('Invalid or expired recovery token');
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 12);

  // Update password
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  // Revoke all existing sessions (force re-login)
  await prisma.session.updateMany({
    where: { userId: user.id },
    data: { revokedAt: new Date() },
  });

  logger.info('Password reset completed', { userId: user.id });

  return {
    success: true,
    message: 'Password reset successfully',
  };
};

/**
 * Change password (for authenticated users)
 */
const changePassword = async (userId, { currentPassword, newPassword }) => {
  if (!currentPassword || !newPassword) {
    throw new ValidationError('Current and new passwords are required');
  }

  if (newPassword.length < 8) {
    throw new ValidationError('Password must be at least 8 characters');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  // Verify current password
  const passwordValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!passwordValid) {
    throw new AuthenticationError('Current password is incorrect');
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 12);

  // Update password
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  // Revoke all sessions except current
  await prisma.session.updateMany({
    where: {
      userId: user.id,
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });

  logger.info('Password changed', { userId: user.id });

  return {
    success: true,
    message: 'Password changed successfully',
  };
};

/**
 * Logout (revoke session)
 */
const logout = async (userId, token) => {
  await prisma.session.updateMany({
    where: {
      userId,
      token,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  logger.info('User logged out', { userId });
};

/**
 * Get current user
 */
const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      language: true,
      createdAt: true,
      subscription: {
        select: {
          planId: true,
          planName: true,
          status: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  return user;
};

module.exports = {
  register,
  login,
  verifyToken,
  refreshAccessToken,
  resetPassword,
  changePassword,
  logout,
  getCurrentUser,
};

