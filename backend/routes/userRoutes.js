/**
 * User Routes
 * 
 * Responsibility: Defines API endpoints for user operations
 * 
 * SECURITY: No password-related endpoints (handled by authentication service)
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/**
 * GET /api/users
 * Gets all users (development/testing only)
 */
router.get('/', userController.getAllUsers);

/**
 * POST /api/users
 * Creates a new user
 * Body: { userId, email, phone?, recoveryMethods? }
 */
router.post('/', userController.createUser);

/**
 * GET /api/users/:userId
 * Gets a user by user ID
 */
router.get('/:userId', userController.getUserById);

/**
 * GET /api/users/email/:email
 * Gets a user by email address
 */
router.get('/email/:email', userController.getUserByEmail);

/**
 * PATCH /api/users/:userId
 * Updates a user
 * Body: { email?, phone?, recoveryMethods? }
 */
router.patch('/:userId', userController.updateUser);

/**
 * DELETE /api/users/:userId
 * Deletes a user
 */
router.delete('/:userId', userController.deleteUser);

module.exports = router;
