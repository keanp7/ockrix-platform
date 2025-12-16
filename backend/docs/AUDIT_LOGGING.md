# Audit Logging System

## 📋 Overview

The audit logging system provides comprehensive logging for all recovery-related operations with timestamps, IP addresses, and structured event data for security monitoring and compliance.

---

## 🎯 Logged Events

### 1. Recovery Attempts
- **Event Type**: `RECOVERY_ATTEMPT`
- **When**: User requests recovery (POST /api/recovery/start)
- **Data Logged**:
  - Session ID
  - User ID (if user exists)
  - Client IP address
  - Request method (email/phone)
  - Identifier (masked email/phone)
  - Whether user exists
  - Timestamp

### 2. Recovery Verification
- **Event Type**: `RECOVERY_VERIFICATION` or `RECOVERY_VERIFICATION_FAILED`
- **When**: Recovery session is verified with AI risk scoring (POST /api/recovery/verify)
- **Data Logged**:
  - Session ID
  - User ID
  - Client IP address
  - Risk level (LOW/MEDIUM/HIGH)
  - Risk score (0-100)
  - Whether recovery was blocked
  - Risk factors identified
  - Timestamp

### 3. Recovery Completion
- **Event Type**: `RECOVERY_COMPLETED` or `RECOVERY_COMPLETION_FAILED`
- **When**: Recovery is completed (POST /api/recovery/complete)
- **Data Logged**:
  - Session ID
  - User ID
  - Client IP address
  - Confirmation ID (on success)
  - Completion timestamp
  - Error message (on failure)
  - Timestamp

### 4. Token Validation
- **Event Type**: `RECOVERY_TOKEN_VALIDATED` or `RECOVERY_TOKEN_VALIDATION_FAILED`
- **When**: Recovery token is validated (POST /api/recovery/validate)
- **Data Logged**:
  - Session ID
  - User ID (if validation successful)
  - Client IP address
  - Success/failure status
  - Failure reason (if failed)
  - Timestamp

---

## 📊 Log Entry Structure

```javascript
{
  id: "audit_1702569600000_abc123def",
  eventType: "RECOVERY_ATTEMPT",
  severity: "INFO",
  timestamp: "2025-12-14T18:00:00.000Z",
  sessionId: "xK9mP2nQ7rS4tU8vW1yZ3aB5cD6eF0gH",
  userId: "user123",
  clientIp: "192.168.1.100",
  requestMethod: "email",
  identifier: "u***@example.com", // Masked
  success: true,
  errorMessage: null,
  metadata: {
    userExists: true
  },
  date: "2025-12-14",
  hour: 18
}
```

---

## 🔒 Security Features

### 1. Data Masking

Sensitive identifiers are automatically masked:
- **Email**: `user@example.com` → `u***@example.com`
- **Phone**: `+1234567890` → `+1***890`

### 2. IP Address Capture

Client IP addresses are captured from multiple sources:
1. `req.ip` (Express trusted proxy)
2. `req.connection.remoteAddress`
3. `req.headers['x-forwarded-for']` (proxy headers)
4. Falls back to `'unknown'` if none available

### 3. Structured Logging

All logs follow a consistent structure for:
- Easy searching and filtering
- Integration with log aggregation tools
- Compliance reporting
- Security analysis

---

## 📝 Usage Examples

### Accessing Audit Logs

```javascript
const auditLogService = require('./services/auditLogService');

// Get all logs
const allLogs = auditLogService.getAuditLogs();

// Filter by event type
const recoveryAttempts = auditLogService.getAuditLogs({
  eventType: 'RECOVERY_ATTEMPT'
});

// Filter by user
const userLogs = auditLogService.getAuditLogs({
  userId: 'user123'
});

// Filter by IP address
const ipLogs = auditLogService.getAuditLogs({
  clientIp: '192.168.1.100'
});

// Filter by date range
const recentLogs = auditLogService.getAuditLogs({
  startDate: new Date('2025-12-14'),
  endDate: new Date('2025-12-15'),
  limit: 100
});
```

### Getting Statistics

```javascript
const stats = auditLogService.getAuditStats({
  startDate: new Date('2025-12-14'),
  endDate: new Date('2025-12-15')
});

console.log(stats);
// {
//   total: 150,
//   byEventType: {
//     RECOVERY_ATTEMPT: 50,
//     RECOVERY_VERIFICATION: 45,
//     RECOVERY_COMPLETED: 40,
//     ...
//   },
//   bySeverity: {
//     INFO: 130,
//     WARN: 15,
//     ERROR: 5
//   },
//   successRate: 85.5,
//   failures: 20,
//   successes: 130,
//   uniqueUsers: 45,
//   uniqueIPs: 30,
//   recentFailures: [...]
// }
```

---

## 🔄 Integration Points

### 1. Recovery Start (POST /api/recovery/start)

```javascript
// Automatically logged in controller
auditLogService.logRecoveryAttempt({
  sessionId,
  userId,
  clientIp,
  requestMethod,
  identifier,
  userExists
});
```

### 2. Recovery Verify (POST /api/recovery/verify)

```javascript
// Automatically logged in controller
auditLogService.logRecoveryVerification({
  sessionId,
  userId,
  clientIp,
  riskLevel,
  riskScore,
  blocked,
  factors
});
```

### 3. Recovery Complete (POST /api/recovery/complete)

```javascript
// Success
auditLogService.logRecoveryCompleted({
  sessionId,
  userId,
  clientIp,
  confirmationId,
  completedAt
});

// Failure
auditLogService.logRecoveryCompletionFailed({
  sessionId,
  clientIp,
  errorMessage,
  reason
});
```

### 4. Token Validation (POST /api/recovery/validate)

```javascript
auditLogService.logTokenValidation({
  sessionId,
  userId,
  clientIp,
  success,
  reason
});
```

---

## 🚀 Production Considerations

### Database Storage

Replace in-memory storage with database:

```javascript
// Store in database instead of memory
const auditEntry = createAuditLog(params);
await db.query(
  'INSERT INTO audit_logs (id, event_type, timestamp, session_id, user_id, client_ip, ...) VALUES ($1, $2, $3, ...)',
  [auditEntry.id, auditEntry.eventType, auditEntry.timestamp, ...]
);
```

### External Logging Services

Integrate with logging services:

- **Splunk**: Forward logs to Splunk
- **ELK Stack**: Send to Elasticsearch
- **CloudWatch**: AWS CloudWatch Logs
- **Datadog**: Datadog log management
- **Sentry**: Error tracking and logging

### Real-time Alerting

Set up alerts for suspicious patterns:

- Multiple failed attempts from same IP
- HIGH risk verifications
- Unusual patterns (e.g., many attempts in short time)
- Failed completions

### Retention Policy

- Store logs for compliance period (e.g., 1-7 years)
- Archive old logs to cold storage
- Implement log rotation

---

## 📈 Monitoring Queries

### Common Queries

```javascript
// Failed recovery attempts
const failures = auditLogService.getAuditLogs({
  eventType: 'RECOVERY_COMPLETION_FAILED',
  limit: 50
});

// High-risk verifications
const highRisk = auditLogService.getAuditLogs({
  eventType: 'RECOVERY_VERIFICATION_FAILED',
  limit: 50
});

// User's recovery history
const userHistory = auditLogService.getAuditLogs({
  userId: 'user123'
});

// IP address activity
const ipActivity = auditLogService.getAuditLogs({
  clientIp: '192.168.1.100'
});
```

---

## ✅ Compliance Benefits

- **Audit Trail**: Complete record of all recovery operations
- **Security Monitoring**: Detect suspicious patterns
- **Forensics**: Investigate security incidents
- **Compliance**: Meet regulatory requirements (GDPR, SOC 2, etc.)
- **Accountability**: Track who did what and when

---

## 🔍 Event Types Reference

| Event Type | Description | Severity |
|------------|-------------|----------|
| `RECOVERY_ATTEMPT` | User requested recovery | INFO |
| `RECOVERY_VERIFICATION` | Session verified (LOW/MEDIUM risk) | INFO |
| `RECOVERY_VERIFICATION_FAILED` | Session blocked (HIGH risk) | WARN |
| `RECOVERY_COMPLETED` | Recovery completed successfully | INFO |
| `RECOVERY_COMPLETION_FAILED` | Recovery completion failed | WARN |
| `RECOVERY_TOKEN_VALIDATED` | Token validated successfully | INFO |
| `RECOVERY_TOKEN_VALIDATION_FAILED` | Token validation failed | WARN |

---

## 📚 Additional Resources

- See `services/auditLogService.js` for implementation details
- See controller files for integration examples
- Consider implementing log aggregation in production
