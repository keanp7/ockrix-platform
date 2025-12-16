# POST /api/recovery/start - Recovery Start Endpoint

## 📋 Overview

The `/api/recovery/start` endpoint initiates a password recovery process for a user identified by email or phone number. This endpoint implements security best practices including user enumeration prevention and audit logging.

---

## 🔒 Security Features

✅ **Input Validation** - Validates email or phone format  
✅ **User Enumeration Prevention** - Same response whether user exists or not  
✅ **Session ID Return** - Returns session ID (not the token)  
✅ **Audit Logging** - Logs all recovery attempts with IP address  
✅ **No Token Exposure** - Token never returned in API response (sent via email/SMS)  

---

## 📡 API Endpoint

**POST** `/api/recovery/start`

### Request Body

Either `email` OR `phone` (exactly one required):

```json
{
  "email": "user@example.com"
}
```

OR

```json
{
  "phone": "+1234567890"
}
```

**NOT both:**
```json
// ❌ INVALID
{
  "email": "user@example.com",
  "phone": "+1234567890"
}
```

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "If an account exists, a recovery token has been sent",
  "sessionId": "xK9mP2nQ7rS4tU8vW1yZ3aB5cD6eF0gH",
  "expiresAt": "2025-12-14T18:10:00.000Z"
}
```

**Note:** The response is the same whether the user exists or not (prevents user enumeration).

### Error Response (400 Bad Request)

```json
{
  "success": false,
  "error": {
    "message": "Either email or phone is required"
  }
}
```

---

## 🔄 Behavior Flow

1. **Accept Input** - Validates that exactly one of email or phone is provided
2. **Validate Format** - Validates email or phone number format
3. **Check User Exists** - Looks up user by email or phone
4. **Generate Token** - If user exists, generates cryptographically secure recovery token
5. **Create Session** - Creates session ID for tracking
6. **Log Attempt** - Logs recovery attempt with:
   - Session ID
   - Request method (email/phone)
   - User identifier (email or phone)
   - Whether user exists
   - User ID (if exists)
   - Client IP address
   - Timestamp
7. **Return Session ID** - Returns session ID (NOT the token)

---

## 📝 Example Usage

### Using cURL

**Request with email:**
```bash
curl -X POST http://localhost:3000/api/recovery/start \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

**Request with phone:**
```bash
curl -X POST http://localhost:3000/api/recovery/start \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890"}'
```

### Using JavaScript (Fetch)

```javascript
const response = await fetch('http://localhost:3000/api/recovery/start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com'
  })
});

const data = await response.json();
console.log('Session ID:', data.sessionId);
```

---

## 🔐 Security Considerations

### 1. User Enumeration Prevention

The endpoint returns the same response format whether the user exists or not:

```json
{
  "success": true,
  "message": "If an account exists, a recovery token has been sent",
  "sessionId": "...",
  "expiresAt": "..."
}
```

This prevents attackers from determining which email addresses or phone numbers are registered.

### 2. Session ID vs Token

- **Session ID**: Returned in API response (safe to expose)
- **Token**: Generated and sent via secure channel (email/SMS), NOT in API response

### 3. Audit Logging

All recovery attempts are logged with:
- Session ID
- Request method (email/phone)
- User identifier
- Whether user exists
- User ID (if exists)
- Client IP address
- Timestamp

**Example log entry:**
```
Recovery attempt started (user found) {
  sessionId: 'xK9mP2nQ7rS4tU8vW1yZ3aB5cD6eF0gH',
  requestMethod: 'email',
  identifier: 'user@example.com',
  userExists: true,
  userId: 'user123',
  timestamp: '2025-12-14T18:00:00.000Z',
  clientIp: '192.168.1.1'
}
```

### 4. Token Delivery

**In Production:**
- Token should be sent via email/SMS
- NOT returned in API response
- Trigger email/SMS service after token generation

**In Development:**
- Token logged to console (with warning)
- Visible in development logs for testing

---

## 🔄 Integration with Other Endpoints

### Complete Recovery Flow

1. **Start Recovery** (`POST /api/recovery/start`)
   - User provides email or phone
   - Returns session ID
   - Token sent via email/SMS

2. **Validate Token** (`POST /api/recovery/validate`)
   - User provides token received via email/SMS
   - Token validated (single-use, expiration checked)
   - Returns user ID if valid

3. **Reset Password** (separate endpoint)
   - User provides new password
   - Password updated (handled by authentication service)

---

## ⚠️ Error Cases

### Missing Input

```json
// Request: {}
// Response: 400
{
  "success": false,
  "error": {
    "message": "Either email or phone is required"
  }
}
```

### Both Email and Phone Provided

```json
// Request: { "email": "...", "phone": "..." }
// Response: 400
{
  "success": false,
  "error": {
    "message": "Provide either email or phone, not both"
  }
}
```

### Invalid Email Format

```json
// Request: { "email": "invalid-email" }
// Response: 400
{
  "success": false,
  "error": {
    "message": "Invalid email format"
  }
}
```

### Invalid Phone Format

```json
// Request: { "phone": "123" }
// Response: 400
{
  "success": false,
  "error": {
    "message": "Invalid phone number format"
  }
}
```

---

## 📊 Session Management

Sessions are stored with the following structure:

```javascript
{
  sessionId: string,        // Unique session identifier
  userId: string | null,    // User ID (null if user not found)
  hashedToken: string | null, // Token hash (null if user not found)
  createdAt: Date,          // Session creation time
  expiresAt: Date,          // Session expiration (10 minutes)
  used: boolean,            // Whether token has been used
  requestMethod: string,    // 'email' or 'phone'
  userNotFound: boolean     // True if user doesn't exist
}
```

---

## ✅ Best Practices

1. **Always use HTTPS** in production
2. **Implement rate limiting** to prevent abuse
3. **Monitor audit logs** for suspicious patterns
4. **Send tokens via secure channels** (email/SMS)
5. **Never return tokens** in API responses (production)
6. **Handle errors gracefully** without revealing user existence

---

## 🚀 Next Steps After Recovery Start

1. Token is sent to user via email/SMS
2. User receives token and uses it to validate
3. After validation, user can reset password
4. Session ID can be used for tracking/logging purposes
