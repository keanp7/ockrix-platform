/**
 * Authentication Controller
 */

const authService = require('../services/authService');
const recoveryTokenService = require('../services/recoveryTokenService');
const { ValidationError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Register new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { email, password, name, phone, language } = req.body;
    const result = await authService.register({ email, password, name, phone, language });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    res.json({
      success: true,
      message: 'Login successful',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    const result = await authService.refreshAccessToken(refreshToken);

    res.json({
      success: true,
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7);
    
    await authService.logout(req.user.id, token);

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Start password recovery
 * POST /api/auth/password/recovery/start
 */
const startPasswordRecovery = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw new ValidationError('Email is required');
    }

    // Use recovery token service to create recovery session
    const token = await recoveryTokenService.createSession(email);

    // SECURITY: In production, send token via email here
    // For now, we'll return it in development only
    const response = {
      success: true,
      message: 'If an account exists, a recovery link has been sent to your email',
    };

    if (process.env.NODE_ENV === 'development') {
      logger.warn('⚠️  DEVELOPMENT MODE: Token returned in response');
      response.token = token; // Remove in production
    }

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password using recovery token
 * POST /api/auth/password/reset
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword({ token, newPassword });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Change password (authenticated)
 * POST /api/auth/password/change
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user.id, { currentPassword, newPassword });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  startPasswordRecovery,
  resetPassword,
  changePassword,
};

