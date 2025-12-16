# Recovery Token System - Usage Guide

## 📋 API Endpoints

### 1. Request Recovery Token

**Endpoint:** `POST /api/recovery/request`

**Request Body:**
```json
{
  "userId": "user@example.com"
}
```

**Response (Development):**
```json
{
  "success": true,
  "message": "Recovery token created successfully",
  "token": "xK9mP2nQ7rS4tU8vW1yZ3aB5cD6eF0gH...",
  "expiresAt": "2025-12-14T18:00:00.000Z"
}
```

**Response (Production):**
```json
{
  "success": true,
  "message": "Recovery token sent to your email"
}
```

**Security Note:** In production, tokens should be sent via email/SMS, not returned in API response.

---

### 2. Validate Recovery Token

**Endpoint:** `POST /api/recovery/validate`

**Request Body:**
```json
{
  "token": "xK9mP2nQ7rS4tU8vW1yZ3aB5cD6eF0gH..."
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Recovery token is valid",
  "userId": "user@example.com"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid or expired recovery token"
}
```

**Note:** Token is consumed (single-use) after successful validation.

---

### 3. Revoke User Tokens

**Endpoint:** `POST /api/recovery/revoke`

**Request Body:**
```json
{
  "userId": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Revoked 3 recovery token(s)",
  "revokedCount": 3
}
```

---

### 4. Get Statistics (Development Only)

**Endpoint:** `GET /api/recovery/stats`

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 10,
    "active": 5,
    "expired": 3,
    "used": 2
  }
}
```

**Note:** This endpoint is disabled in production for security.

---

## 💻 Usage Examples

### Using the Service Directly

```javascript
const recoveryTokenService = require('./services/recoveryTokenService');

// Create a recovery token
const { token, expiresAt } = await recoveryTokenService.createRecoveryToken('user@example.com');

// Send token via email (example)
await emailService.send({
  to: 'user@example.com',
  subject: 'Password Recovery Token',
  body: `Your recovery token is: ${token}. It expires in 10 minutes.`
});

// Validate token
const { userId, isValid } = await recoveryTokenService.validateRecoveryToken(token);

if (isValid) {
  console.log(`Token valid for user: ${userId}`);
  // Proceed with password reset or account recovery
} else {
  console.log('Invalid token');
}
```

---

### Complete Password Reset Flow

```javascript
// Step 1: User requests password reset
router.post('/password-reset/request', async (req, res) => {
  const { email } = req.body;
  
  // Create recovery token
  const { token } = await recoveryTokenService.createRecoveryToken(email);
  
  // Send token via email
  await emailService.sendRecoveryEmail(email, token);
  
  res.json({ success: true, message: 'Recovery email sent' });
});

// Step 2: User validates token and resets password
router.post('/password-reset/confirm', async (req, res) => {
  const { token, newPassword } = req.body;
  
  // Validate token (single-use, expiration checked)
  const { userId, isValid } = await recoveryTokenService.validateRecoveryToken(token);
  
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }
  
  // Token is valid and consumed - update password
  await userService.updatePassword(userId, newPassword);
  
  // Revoke any remaining tokens for this user
  recoveryTokenService.revokeUserTokens(userId);
  
  res.json({ success: true, message: 'Password reset successful' });
});
```

---

## 🔒 Security Checklist

- [ ] Tokens sent via HTTPS email/SMS only
- [ ] Never log plain tokens
- [ ] Tokens expire after 10 minutes
- [ ] Single-use enforcement (tokens consumed after validation)
- [ ] Rate limiting on token creation endpoint
- [ ] User notification when tokens are created/used
- [ ] Old tokens revoked when new ones are created

---

## 📊 Testing

### Test Token Creation

```bash
curl -X POST http://localhost:3000/api/recovery/request \
  -H "Content-Type: application/json" \
  -d '{"userId": "test@example.com"}'
```

### Test Token Validation

```bash
curl -X POST http://localhost:3000/api/recovery/validate \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_TOKEN_HERE"}'
```

### Test Token Revocation

```bash
curl -X POST http://localhost:3000/api/recovery/revoke \
  -H "Content-Type: application/json" \
  -d '{"userId": "test@example.com"}'
```

---

## ⚠️ Important Notes

1. **Token Storage:** Tokens are stored as bcrypt hashes (zero-knowledge)
2. **Single-Use:** Each token can only be used once
3. **Expiration:** Tokens expire after 10 minutes
4. **Development vs Production:** Token returned in API response only in development mode
5. **Rate Limiting:** Add rate limiting to prevent abuse (recommended: 3 requests per 15 minutes)
