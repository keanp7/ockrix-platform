/**
 * Recovery Token Controller
 * 
 * Responsibility: Handles HTTP requests for recovery token operations
 * 
 * SECURITY NOTES:
 * - Never log plain tokens
 * - Always use secure channels (HTTPS) for token transmission
 * - Send tokens via email/SMS, never in API responses (except for testing)
 */

const recoveryTokenService = require('../services/recoveryTokenService');
const riskScoringService = require('../services/riskScoringService');
const auditLogService = require('../services/auditLogService');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Starts a recovery process for a user identified by email or phone
 * 
 * SECURITY FEATURES:
 * - Accepts email OR phone (not both, exactly one required)
 * - Validates input format
 * - Checks if user exists
 * - Generates recovery token and session ID
 * - Returns session ID (NOT the token - prevents token exposure)
 * - Logs attempt for audit (including IP address)
 * - Never reveals if user exists (prevents user enumeration)
 * 
 * POST /api/recovery/start
 * Body: { email?: "user@example.com", phone?: "+1234567890" }
 */
const startRecovery = async (req, res, next) => {
  try {
    const { email, phone } = req.body;

    // Validation handled by service, but check here for early return
    if (!email && !phone) {
      throw new ValidationError('Either email or phone is required');
    }

    if (email && phone) {
      throw new ValidationError('Provide either email or phone, not both');
    }

    // Get client IP for audit logging
    const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';

    // Start recovery process
    const { sessionId, expiresAt, userId, userExists, identifier, requestMethod } = await recoveryTokenService.startRecovery({
      email,
      phone,
      clientIp // Pass IP for audit logging
    });

    // Audit log: Recovery attempt
    auditLogService.logRecoveryAttempt({
      sessionId,
      userId: userId || null,
      clientIp,
      requestMethod: requestMethod || (email ? 'email' : 'phone'),
      identifier: identifier || email || phone,
      userExists: userExists !== false
    });

    // SECURITY: Always return same response format whether user exists or not
    // Prevents user enumeration attacks
    res.status(200).json({
      success: true,
      message: 'If an account exists, a recovery token has been sent',
      sessionId, // Return session ID for tracking
      expiresAt
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verifies a recovery session with AI risk scoring
 * 
 * SECURITY FEATURES:
 * - Validates session ID
 * - Runs AI risk scoring analysis
 * - Blocks recovery if HIGH risk detected
 * - Returns risk level and factors
 * 
 * POST /api/recovery/verify
 * Body: { sessionId: "session-id..." }
 */
const verifyRecovery = async (req, res, next) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      throw new ValidationError('Session ID is required');
    }

    // Get client IP for audit logging
    const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';

    // Run AI risk scoring (currently mocked, will be replaced with real AI)
    const riskAssessment = await riskScoringService.assessRecoveryRisk(sessionId);

    // Get session data for audit logging
    const sessionData = recoveryTokenService.getSessionData(sessionId);
    const userId = sessionData?.userId || null;

    // Audit log: Recovery verification
    auditLogService.logRecoveryVerification({
      sessionId,
      userId,
      clientIp,
      riskLevel: riskAssessment.riskLevel,
      riskScore: riskAssessment.score,
      blocked: riskAssessment.blocked,
      factors: riskAssessment.factors || []
    });

    // If HIGH risk, block recovery
    if (riskAssessment.blocked) {
      return res.status(403).json({
        success: false,
        error: 'Recovery attempt blocked due to security risk',
        riskLevel: riskAssessment.riskLevel,
        blocked: true,
        // In production, don't expose detailed factors to prevent gaming
        ...(process.env.NODE_ENV === 'development' && {
          score: riskAssessment.score,
          factors: riskAssessment.factors,
          confidence: riskAssessment.confidence
        })
      });
    }

    // LOW or MEDIUM risk - allow to proceed

    res.status(200).json({
      success: true,
      message: 'Recovery session verified',
      riskLevel: riskAssessment.riskLevel,
      blocked: false,
      // Include additional details for frontend decision-making
      ...(process.env.NODE_ENV === 'development' && {
        score: riskAssessment.score,
        factors: riskAssessment.factors,
        confidence: riskAssessment.confidence
      })
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a new recovery token for a user
 * 
 * SECURITY: Token should be sent via secure channel (email/SMS)
 * Never include plain token in API response in production
 * 
 * POST /api/recovery/request
 * Body: { userId: "user@example.com" }
 */
const requestRecoveryToken = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    // Create recovery token
    const { token, expiresAt } = await recoveryTokenService.createRecoveryToken(userId);

    // SECURITY WARNING: In production, send token via email/SMS, not API response
    // This is only for development/testing purposes
    if (process.env.NODE_ENV === 'development') {
      logger.warn('⚠️  DEVELOPMENT MODE: Token returned in API response. In production, send via email/SMS.');
    }

    // In production, you would:
    // 1. Send token via email: await emailService.sendRecoveryEmail(userId, token);
    // 2. Return success without token in response
    // 3. Log: "Recovery token sent to user via email"
    
    res.status(200).json({
      success: true,
      message: 'Recovery token created successfully',
      // Only include token in development/testing
      ...(process.env.NODE_ENV === 'development' && {
        token, // ⚠️ REMOVE IN PRODUCTION
        expiresAt
      })
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validates a recovery token
 * 
 * POST /api/recovery/validate
 * Body: { token: "base64token..." }
 */
const validateToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new ValidationError('Token is required');
    }

    // Validate token (single-use, expiration checked inside)
    const { userId, isValid } = await recoveryTokenService.validateRecoveryToken(token);

    if (!isValid) {
      // SECURITY: Don't reveal why validation failed (invalid/expired/used)
      // Prevents information leakage to attackers
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired recovery token'
      });
    }

    // Token is valid - user can proceed with recovery
    // In production, you might want to:
    // 1. Create a session for the user
    // 2. Return a temporary session token
    // 3. Allow password reset to proceed

    res.status(200).json({
      success: true,
      message: 'Recovery token is valid',
      userId // Return user ID so frontend knows which user is recovering
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Completes the recovery process by validating token and marking session as used
 * 
 * SECURITY FEATURES:
 * - Validates recovery token (expiration, single-use)
 * - Marks token and session as used (prevents replay)
 * - Returns secure reset confirmation ID
 * - Logs success or failure for audit
 * 
 * POST /api/recovery/complete
 * Body: { token: "base64token..." }
 */
const completeRecovery = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new ValidationError('Recovery token is required');
    }

    // Get client IP for audit logging
    const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';

    // Complete recovery (validates token, marks as used, generates confirmation)
    const result = await recoveryTokenService.completeRecovery(token);

    if (!result.success) {
      // Audit log: Recovery completion failed
      auditLogService.logRecoveryCompletionFailed({
        sessionId: result.sessionId || null,
        clientIp,
        errorMessage: result.error || 'Recovery completion failed',
        reason: 'token_validation_failed'
      });

      return res.status(400).json({
        success: false,
        error: result.error || 'Recovery completion failed'
      });
    }

    // Audit log: Recovery completed successfully
    auditLogService.logRecoveryCompleted({
      sessionId: result.sessionId,
      userId: result.userId,
      clientIp,
      confirmationId: result.confirmationId,
      completedAt: result.completedAt
    });

    // Return secure reset confirmation
    // The confirmationId can be used to authorize password reset
    res.status(200).json({
      success: true,
      message: 'Recovery completed successfully',
      userId: result.userId,
      confirmationId: result.confirmationId, // Secure confirmation for password reset
      completedAt: result.completedAt,
      // Note: The token is now consumed and cannot be reused
      // Use confirmationId for subsequent password reset operations
    });
  } catch (error) {
    // Log error for audit
    logger.error('Recovery completion error', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    next(error);
  }
};

/**
 * Revokes all recovery tokens for a user
 * 
 * POST /api/recovery/revoke
 * Body: { userId: "user@example.com" }
 */
const revokeTokens = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    const revokedCount = recoveryTokenService.revokeUserTokens(userId);

    res.status(200).json({
      success: true,
      message: `Revoked ${revokedCount} recovery token(s)`,
      revokedCount
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Gets token statistics (for monitoring - restrict in production)
 * 
 * GET /api/recovery/stats
 */
const getStats = async (req, res, next) => {
  try {
    // SECURITY: Restrict this endpoint in production
    // Only allow for admins or remove entirely
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'Statistics endpoint not available in production'
      });
    }

    const stats = recoveryTokenService.getTokenStats();

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startRecovery,
  verifyRecovery,
  requestRecoveryToken,
  validateToken,
  completeRecovery,
  revokeTokens,
  getStats
};