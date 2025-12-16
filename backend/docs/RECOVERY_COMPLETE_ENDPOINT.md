# POST /api/recovery/complete - Recovery Completion Endpoint

## 📋 Overview

The `/api/recovery/complete` endpoint finalizes the recovery process by validating the recovery token, marking the session as used, and returning a secure reset confirmation. This is the final step before password reset.

---

## 🔒 Security Features

✅ **Token Validation** - Validates recovery token (expiration, single-use)  
✅ **Session Marking** - Marks token and session as used (prevents replay)  
✅ **Secure Confirmation** - Returns cryptographically secure confirmation ID  
✅ **Audit Logging** - Logs success or failure for security audit  

---

## 📡 API Endpoint

**POST** `/api/recovery/complete`

### Request Body

```json
{
  "token": "xK9mP2nQ7rS4tU8vW1yZ3aB5cD6eF0gH..."
}
```

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Recovery completed successfully",
  "userId": "user123",
  "confirmationId": "yL0nQ3oR8sT5uV9wX2zA4bC7dE1fG2hI...",
  "completedAt": "2025-12-14T18:05:00.000Z"
}
```

### Error Response (400 Bad Request)

```json
{
  "success": false,
  "error": "Invalid or expired recovery token"
}
```

---

## 🔄 Behavior Flow

1. **Accept Token** - Validates token is provided
2. **Validate Token** - Checks token validity:
   - Token hasn't expired
   - Token hasn't been used (single-use enforcement)
   - Token matches stored hash
3. **Mark as Used** - Marks token and session as used (prevents replay)
4. **Generate Confirmation** - Creates secure confirmation ID
5. **Log Success** - Logs completion for audit trail
6. **Return Confirmation** - Returns confirmation ID for password reset

---

## 🔐 Security Considerations

### 1. Single-Use Enforcement

- Token is marked as used immediately after validation
- Session is marked as used for audit trail
- Prevents replay attacks (token cannot be reused)

### 2. Secure Confirmation ID

- Confirmation ID is cryptographically secure (same generation as session IDs)
- Can be used to authorize password reset operations
- Should be used within reasonable time window

### 3. Audit Logging

All completion attempts are logged:
- **Success**: userId, sessionId, confirmationId, completedAt
- **Failure**: error message, timestamp

---

## 📝 Example Usage

### Using cURL

```bash
curl -X POST http://localhost:3000/api/recovery/complete \
  -H "Content-Type: application/json" \
  -d '{"token": "xK9mP2nQ7rS4tU8vW1yZ3aB5cD6eF0gH..."}'
```

### Using JavaScript (Fetch)

```javascript
const response = await fetch('http://localhost:3000/api/recovery/complete', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: 'xK9mP2nQ7rS4tU8vW1yZ3aB5cD6eF0gH...'
  })
});

const data = await response.json();

if (data.success) {
  console.log('Recovery completed!');
  console.log('Confirmation ID:', data.confirmationId);
  console.log('User ID:', data.userId);
  // Use confirmationId to proceed with password reset
} else {
  console.error('Recovery failed:', data.error);
}
```

---

## 🔄 Complete Recovery Flow

1. **Start Recovery** (`POST /api/recovery/start`)
   - User provides email/phone
   - Returns session ID
   - Token sent via email/SMS

2. **Verify Recovery** (`POST /api/recovery/verify`) [Optional]
   - Verify session with AI risk scoring
   - Check risk level

3. **Validate Token** (`POST /api/recovery/validate`) [Optional]
   - Validate token format
   - Token consumed here

4. **Complete Recovery** (`POST /api/recovery/complete`) ← **This endpoint**
   - Validate token (final check)
   - Mark session as used
   - Return confirmation ID

5. **Reset Password** (separate endpoint)
   - Use confirmationId to authorize password reset
   - Update password

---

## ⚠️ Error Cases

### Missing Token

```json
// Request: {}
// Response: 400
{
  "success": false,
  "error": {
    "message": "Recovery token is required"
  }
}
```

### Invalid/Expired Token

```json
// Request: { "token": "invalid-token" }
// Response: 400
{
  "success": false,
  "error": "Invalid or expired recovery token"
}
```

### Already Used Token

```json
// Request: { "token": "already-used-token" }
// Response: 400
{
  "success": false,
  "error": "Invalid or expired recovery token"
}
```

**Note:** Same error message for all failure cases (prevents information leakage).

---

## 📊 Response Fields

### Success Response

- `success` (boolean): Always `true` on success
- `message` (string): Success message
- `userId` (string): User identifier for password reset
- `confirmationId` (string): Secure confirmation ID for password reset authorization
- `completedAt` (Date): Timestamp of completion

### Confirmation ID Usage

The `confirmationId` can be used in subsequent password reset operations:

```javascript
// After completing recovery
const { confirmationId, userId } = await completeRecovery(token);

// Use confirmationId for password reset
await resetPassword({
  userId,
  confirmationId,
  newPassword: 'secure-password'
});
```

---

## ✅ Best Practices

1. **Call after token validation** - Complete recovery after validating token
2. **Use confirmation immediately** - Confirmation ID should be used soon after generation
3. **Store confirmation securely** - Don't expose confirmation ID in logs
4. **Handle errors gracefully** - Don't reveal why validation failed
5. **Monitor completion rates** - Track successful vs failed completions

---

## 🔒 Security Notes

- Token is consumed after completion (cannot be reused)
- Confirmation ID is cryptographically secure
- All operations are logged for audit
- Same error message for all failure cases (prevents enumeration)
