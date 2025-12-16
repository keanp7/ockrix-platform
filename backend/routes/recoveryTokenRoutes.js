/**
 * Recovery Token Routes
 * 
 * Responsibility: Defines API endpoints for recovery token operations
 */

const express = require('express');
const router = express.Router();
const recoveryTokenController = require('../controllers/recoveryTokenController');
const { 
  recoveryRateLimiter, 
  verificationRateLimiter, 
  tokenOperationRateLimiter 
} = require('../middleware/rateLimiter');

/**
 * POST /api/recovery/start
 * Starts a recovery process for a user (by email or phone)
 * Body: { email?: "user@example.com", phone?: "+1234567890" }
 * Returns: { sessionId, expiresAt } (NOT the token - token sent via email/SMS)
 * 
 * Rate Limit: 5 requests per 15 minutes (strict to prevent brute-force)
 */
router.post('/start', recoveryRateLimiter, recoveryTokenController.startRecovery);

/**
 * POST /api/recovery/request
 * Creates a new recovery token for a user
 * Body: { userId: "user@example.com" }
 * 
 * Rate Limit: 5 requests per 15 minutes (strict to prevent brute-force)
 */
router.post('/request', recoveryRateLimiter, recoveryTokenController.requestRecoveryToken);

/**
 * POST /api/recovery/verify
 * Verifies a recovery session with AI risk scoring
 * Body: { sessionId: "session-id..." }
 * Returns: { riskLevel: "LOW"|"MEDIUM"|"HIGH", blocked: boolean }
 * 
 * Rate Limit: 10 requests per 15 minutes
 */
router.post('/verify', verificationRateLimiter, recoveryTokenController.verifyRecovery);

/**
 * POST /api/recovery/validate
 * Validates a recovery token (consumes it - single-use)
 * Body: { token: "base64token..." }
 * 
 * Rate Limit: 20 requests per 15 minutes
 */
router.post('/validate', tokenOperationRateLimiter, recoveryTokenController.validateToken);

/**
 * POST /api/recovery/complete
 * Completes recovery by validating token and marking session as used
 * Body: { token: "base64token..." }
 * Returns: { confirmationId, userId, completedAt }
 * 
 * Rate Limit: 20 requests per 15 minutes
 */
router.post('/complete', tokenOperationRateLimiter, recoveryTokenController.completeRecovery);

/**
 * POST /api/recovery/revoke
 * Revokes all recovery tokens for a user
 * Body: { userId: "user@example.com" }
 * 
 * Rate Limit: 10 requests per 15 minutes
 */
router.post('/revoke', verificationRateLimiter, recoveryTokenController.revokeTokens);

/**
 * GET /api/recovery/stats
 * Gets token statistics (development only)
 */
router.get('/stats', recoveryTokenController.getStats);

module.exports = router;
