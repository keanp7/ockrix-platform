const logger = require('../utils/logger');

/**
 * Audit Logging Service
 * 
 * Responsibility: Provides structured audit logging for security-critical operations
 * 
 * FEATURES:
 * - Structured log format
 * - Timestamp tracking
 * - IP address logging
 * - Event categorization
 * - Searchable/filterable logs
 * 
 * FUTURE: Can be extended to:
 * - Store logs in database
 * - Send to external logging service (Splunk, ELK, etc.)
 * - Real-time alerting
 * - Compliance reporting
 */

/**
 * Audit log storage (in-memory for now, replace with database in production)
 * Structure: Array of log entries
 */
const auditLogs = [];

/**
 * Event types for categorization
 */
const EventType = {
  RECOVERY_ATTEMPT: 'RECOVERY_ATTEMPT',
  RECOVERY_VERIFICATION: 'RECOVERY_VERIFICATION',
  RECOVERY_VERIFICATION_FAILED: 'RECOVERY_VERIFICATION_FAILED',
  RECOVERY_COMPLETED: 'RECOVERY_COMPLETED',
  RECOVERY_COMPLETION_FAILED: 'RECOVERY_COMPLETION_FAILED',
  RECOVERY_TOKEN_VALIDATED: 'RECOVERY_TOKEN_VALIDATED',
  RECOVERY_TOKEN_VALIDATION_FAILED: 'RECOVERY_TOKEN_VALIDATION_FAILED'
};

/**
 * Severity levels
 */
const Severity = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL'
};

/**
 * Creates an audit log entry
 * 
 * @param {Object} params - Audit log parameters
 * @param {string} params.eventType - Type of event (EventType enum)
 * @param {string} params.severity - Severity level (Severity enum)
 * @param {string} params.sessionId - Recovery session ID
 * @param {string} params.userId - User ID (if available)
 * @param {string} params.clientIp - Client IP address
 * @param {string} params.requestMethod - Request method (email/phone)
 * @param {string} params.identifier - Email or phone used
 * @param {Object} params.metadata - Additional metadata
 * @param {boolean} params.success - Whether operation was successful
 * @param {string} params.errorMessage - Error message (if failed)
 * @returns {Object} Audit log entry
 */
const createAuditLog = (params) => {
  const {
    eventType,
    severity = Severity.INFO,
    sessionId,
    userId = null,
    clientIp,
    requestMethod = null,
    identifier = null,
    metadata = {},
    success = true,
    errorMessage = null
  } = params;

  const timestamp = new Date();
  
  const auditEntry = {
    id: generateLogId(),
    eventType,
    severity,
    timestamp: timestamp.toISOString(),
    sessionId,
    userId,
    clientIp: clientIp || 'unknown',
    requestMethod,
    identifier: identifier ? maskSensitiveData(identifier) : null, // Mask sensitive data
    success,
    errorMessage,
    metadata,
    // Additional computed fields
    date: timestamp.toISOString().split('T')[0], // Date for filtering
    hour: timestamp.getHours() // Hour for analysis
  };

  // Store in memory (in production, save to database)
  auditLogs.push(auditEntry);

  // Log to console with structured format
  logToConsole(auditEntry);

  return auditEntry;
};

/**
 * Logs a recovery attempt
 * 
 * @param {Object} params
 * @param {string} params.sessionId - Session ID
 * @param {string} params.userId - User ID (if user exists)
 * @param {string} params.clientIp - Client IP
 * @param {string} params.requestMethod - 'email' or 'phone'
 * @param {string} params.identifier - Email or phone
 * @param {boolean} params.userExists - Whether user exists
 */
const logRecoveryAttempt = (params) => {
  const {
    sessionId,
    userId,
    clientIp,
    requestMethod,
    identifier,
    userExists
  } = params;

  return createAuditLog({
    eventType: EventType.RECOVERY_ATTEMPT,
    severity: Severity.INFO,
    sessionId,
    userId,
    clientIp,
    requestMethod,
    identifier,
    success: userExists,
    metadata: {
      userExists
    }
  });
};

/**
 * Logs recovery verification (risk scoring)
 * 
 * @param {Object} params
 * @param {string} params.sessionId - Session ID
 * @param {string} params.userId - User ID
 * @param {string} params.clientIp - Client IP
 * @param {string} params.riskLevel - Risk level (LOW/MEDIUM/HIGH)
 * @param {number} params.riskScore - Risk score (0-100)
 * @param {boolean} params.blocked - Whether recovery was blocked
 * @param {Array<string>} params.factors - Risk factors identified
 */
const logRecoveryVerification = (params) => {
  const {
    sessionId,
    userId,
    clientIp,
    riskLevel,
    riskScore,
    blocked,
    factors = []
  } = params;

  const eventType = blocked 
    ? EventType.RECOVERY_VERIFICATION_FAILED 
    : EventType.RECOVERY_VERIFICATION;
  
  const severity = blocked ? Severity.WARN : Severity.INFO;

  return createAuditLog({
    eventType,
    severity,
    sessionId,
    userId,
    clientIp,
    success: !blocked,
    errorMessage: blocked ? `Recovery blocked due to ${riskLevel} risk` : null,
    metadata: {
      riskLevel,
      riskScore,
      blocked,
      factors: factors.slice(0, 5) // Limit factors for storage
    }
  });
};

/**
 * Logs recovery completion (success)
 * 
 * @param {Object} params
 * @param {string} params.sessionId - Session ID
 * @param {string} params.userId - User ID
 * @param {string} params.clientIp - Client IP
 * @param {string} params.confirmationId - Confirmation ID generated
 * @param {Date} params.completedAt - Completion timestamp
 */
const logRecoveryCompleted = (params) => {
  const {
    sessionId,
    userId,
    clientIp,
    confirmationId,
    completedAt
  } = params;

  return createAuditLog({
    eventType: EventType.RECOVERY_COMPLETED,
    severity: Severity.INFO,
    sessionId,
    userId,
    clientIp,
    success: true,
    metadata: {
      confirmationId,
      completedAt: completedAt ? completedAt.toISOString() : new Date().toISOString()
    }
  });
};

/**
 * Logs recovery completion failure
 * 
 * @param {Object} params
 * @param {string} params.sessionId - Session ID (if available)
 * @param {string} params.clientIp - Client IP
 * @param {string} params.errorMessage - Error message
 * @param {string} params.reason - Reason for failure
 */
const logRecoveryCompletionFailed = (params) => {
  const {
    sessionId,
    clientIp,
    errorMessage,
    reason = 'unknown'
  } = params;

  return createAuditLog({
    eventType: EventType.RECOVERY_COMPLETION_FAILED,
    severity: Severity.WARN,
    sessionId,
    clientIp,
    success: false,
    errorMessage,
    metadata: {
      reason
    }
  });
};

/**
 * Logs token validation
 * 
 * @param {Object} params
 * @param {string} params.sessionId - Session ID (if available)
 * @param {string} params.userId - User ID (if validation successful)
 * @param {string} params.clientIp - Client IP
 * @param {boolean} params.success - Whether validation was successful
 * @param {string} params.reason - Reason for failure (if failed)
 */
const logTokenValidation = (params) => {
  const {
    sessionId,
    userId,
    clientIp,
    success,
    reason = null
  } = params;

  const eventType = success 
    ? EventType.RECOVERY_TOKEN_VALIDATED 
    : EventType.RECOVERY_TOKEN_VALIDATION_FAILED;

  return createAuditLog({
    eventType,
    severity: success ? Severity.INFO : Severity.WARN,
    sessionId,
    userId,
    clientIp,
    success,
    errorMessage: success ? null : reason
  });
};

/**
 * Masks sensitive data in identifiers
 * 
 * @param {string} identifier - Email or phone
 * @returns {string} Masked identifier
 */
const maskSensitiveData = (identifier) => {
  if (!identifier) return null;

  // Mask email: user@example.com -> u***@example.com
  if (identifier.includes('@')) {
    const [local, domain] = identifier.split('@');
    if (local.length > 2) {
      return `${local[0]}***@${domain}`;
    }
    return `***@${domain}`;
  }

  // Mask phone: +1234567890 -> +1***890
  if (identifier.length > 6) {
    const start = identifier.substring(0, 2);
    const end = identifier.substring(identifier.length - 3);
    return `${start}***${end}`;
  }

  return '***';
};

/**
 * Generates a unique log ID
 * 
 * @returns {string} Unique log ID
 */
const generateLogId = () => {
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Logs audit entry to console with structured format
 * 
 * @param {Object} auditEntry - Audit log entry
 */
const logToConsole = (auditEntry) => {
  const logMessage = `[AUDIT] ${auditEntry.eventType} | ${auditEntry.severity} | ${auditEntry.timestamp} | Session: ${auditEntry.sessionId || 'N/A'} | User: ${auditEntry.userId || 'N/A'} | IP: ${auditEntry.clientIp} | Success: ${auditEntry.success}`;

  switch (auditEntry.severity) {
    case Severity.CRITICAL:
    case Severity.ERROR:
      logger.error(logMessage, auditEntry);
      break;
    case Severity.WARN:
      logger.warn(logMessage, auditEntry);
      break;
    default:
      logger.info(logMessage, auditEntry);
  }
};

/**
 * Gets audit logs (for monitoring/debugging)
 * 
 * @param {Object} filters - Filter criteria
 * @param {string} filters.eventType - Filter by event type
 * @param {string} filters.userId - Filter by user ID
 * @param {string} filters.sessionId - Filter by session ID
 * @param {string} filters.clientIp - Filter by IP address
 * @param {Date} filters.startDate - Start date filter
 * @param {Date} filters.endDate - End date filter
 * @param {number} filters.limit - Maximum number of logs to return
 * @returns {Array} Filtered audit logs
 */
const getAuditLogs = (filters = {}) => {
  let logs = [...auditLogs];

  // Apply filters
  if (filters.eventType) {
    logs = logs.filter(log => log.eventType === filters.eventType);
  }

  if (filters.userId) {
    logs = logs.filter(log => log.userId === filters.userId);
  }

  if (filters.sessionId) {
    logs = logs.filter(log => log.sessionId === filters.sessionId);
  }

  if (filters.clientIp) {
    logs = logs.filter(log => log.clientIp === filters.clientIp);
  }

  if (filters.startDate) {
    const start = new Date(filters.startDate);
    logs = logs.filter(log => new Date(log.timestamp) >= start);
  }

  if (filters.endDate) {
    const end = new Date(filters.endDate);
    logs = logs.filter(log => new Date(log.timestamp) <= end);
  }

  // Sort by timestamp (newest first)
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Apply limit
  if (filters.limit) {
    logs = logs.slice(0, filters.limit);
  }

  return logs;
};

/**
 * Gets audit statistics
 * 
 * @param {Object} filters - Filter criteria
 * @returns {Object} Audit statistics
 */
const getAuditStats = (filters = {}) => {
  const logs = getAuditLogs(filters);

  const stats = {
    total: logs.length,
    byEventType: {},
    bySeverity: {},
    successRate: 0,
    failures: 0,
    successes: 0,
    uniqueUsers: new Set(),
    uniqueIPs: new Set(),
    recentFailures: []
  };

  logs.forEach(log => {
    // Count by event type
    stats.byEventType[log.eventType] = (stats.byEventType[log.eventType] || 0) + 1;

    // Count by severity
    stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;

    // Count successes/failures
    if (log.success) {
      stats.successes++;
    } else {
      stats.failures++;
      // Keep recent failures
      if (stats.recentFailures.length < 10) {
        stats.recentFailures.push({
          timestamp: log.timestamp,
          eventType: log.eventType,
          errorMessage: log.errorMessage,
          clientIp: log.clientIp
        });
      }
    }

    // Track unique users and IPs
    if (log.userId) {
      stats.uniqueUsers.add(log.userId);
    }
    if (log.clientIp && log.clientIp !== 'unknown') {
      stats.uniqueIPs.add(log.clientIp);
    }
  });

  // Calculate success rate
  if (stats.total > 0) {
    stats.successRate = (stats.successes / stats.total) * 100;
  }

  stats.uniqueUsers = stats.uniqueUsers.size;
  stats.uniqueIPs = stats.uniqueIPs.size;

  return stats;
};

module.exports = {
  EventType,
  Severity,
  logRecoveryAttempt,
  logRecoveryVerification,
  logRecoveryCompleted,
  logRecoveryCompletionFailed,
  logTokenValidation,
  getAuditLogs,
  getAuditStats,
  createAuditLog
};
