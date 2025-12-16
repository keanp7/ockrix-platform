/**
 * User Controller
 * 
 * Responsibility: Handles HTTP requests for user operations
 * 
 * SECURITY NOTES:
 * - No password operations (handled by authentication service)
 * - Returns user data without sensitive information
 * - Validates input before processing
 */

const userService = require('../services/userService');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');

/**
 * Creates a new user
 * 
 * POST /api/users
 * Body: { userId: "user123", email: "user@example.com", phone?: "+1234567890", recoveryMethods?: ["email", "phone"] }
 */
const createUser = async (req, res, next) => {
  try {
    const { userId, email, phone, recoveryMethods } = req.body;

    const user = await userService.createUser({
      userId,
      email,
      phone,
      recoveryMethods
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Gets a user by user ID
 * 
 * GET /api/users/:userId
 */
const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = userService.getUserById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Gets a user by email
 * 
 * GET /api/users/email/:email
 */
const getUserByEmail = async (req, res, next) => {
  try {
    const { email } = req.params;

    const user = userService.getUserByEmail(email);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Updates a user
 * 
 * PATCH /api/users/:userId
 * Body: { email?: "new@example.com", phone?: "+1234567890", recoveryMethods?: ["email"] }
 */
const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Prevent updating userId (immutable)
    if (updates.userId) {
      throw new ValidationError('User ID cannot be changed');
    }

    const user = await userService.updateUser(userId, updates);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a user
 * 
 * DELETE /api/users/:userId
 */
const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const deleted = userService.deleteUser(userId);

    if (!deleted) {
      throw new NotFoundError('User not found');
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Gets all users (admin/testing only - restrict in production)
 * 
 * GET /api/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    // SECURITY: Restrict this endpoint in production
    // Only allow for admins or remove entirely
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'This endpoint is not available in production'
      });
    }

    const users = userService.getAllUsers();
    const count = userService.getUserCount();

    res.status(200).json({
      success: true,
      count,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
  getAllUsers
};
