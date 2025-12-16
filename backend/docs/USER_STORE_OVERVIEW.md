# User Store Overview

## 📋 Architecture

The user store follows a **zero-knowledge architecture** - it stores user identifiers and recovery methods, but **NO PASSWORDS**.

---

## 🏗️ User Schema

```javascript
{
  userId: string,              // Unique identifier (immutable)
  email: string,               // Email address (unique, indexed)
  phone: string | null,        // Phone number (optional, indexed)
  recoveryMethods: string[],   // Available recovery methods
  createdAt: Date,             // Account creation timestamp
  updatedAt: Date              // Last update timestamp
}
```

### Recovery Methods

Valid recovery methods:
- `email` - Email-based recovery
- `phone` - Phone-based recovery
- `sms` - SMS-based recovery
- `totp` - Time-based One-Time Password (TOTP)

---

## 🔒 Zero-Knowledge Design

### What IS Stored:
- ✅ User identifiers (userId, email, phone)
- ✅ Recovery methods (which methods are enabled)
- ✅ Metadata (timestamps)

### What is NOT Stored:
- ❌ **NO PASSWORDS** (handled by authentication service)
- ❌ **NO PASSWORD HASHES** (zero-knowledge design)
- ❌ **NO RECOVERY TOKENS** (stored separately, hashed)

### Why This is Secure:

1. **Separation of Concerns:**
   - User store: Identity information
   - Authentication service: Password handling (OAuth, Auth0, etc.)
   - Recovery token service: Token generation and validation

2. **Limited Attack Surface:**
   - If user store is compromised, no password hashes are exposed
   - Passwords managed by dedicated authentication service
   - Recovery tokens stored separately (hashed, zero-knowledge)

3. **Compliance:**
   - Reduced liability (fewer sensitive data points)
   - Easier to comply with data protection regulations
   - Clear data boundaries

---

## 🔄 Integration with Recovery Token System

### Password Reset Flow

```
1. User requests password reset
   ↓
2. Check if user exists (userService.getUserByEmail)
   ↓
3. Check recovery methods (user.recoveryMethods)
   ↓
4. Create recovery token (recoveryTokenService.createRecoveryToken)
   ↓
5. Send token via user's preferred recovery method
   - If recoveryMethods includes 'email': Send via email
   - If recoveryMethods includes 'phone'/'sms': Send via SMS
   ↓
6. User validates token (recoveryTokenService.validateRecoveryToken)
   ↓
7. Token validated → Allow password reset
   ↓
8. Password reset handled by authentication service (NOT user store)
```

### Example Implementation

```javascript
// Password reset request
router.post('/password-reset/request', async (req, res) => {
  const { email } = req.body;
  
  // 1. Get user by email
  const user = userService.getUserByEmail(email);
  if (!user) {
    // Don't reveal if user exists (security)
    return res.json({ success: true, message: 'If user exists, recovery email sent' });
  }
  
  // 2. Check if email recovery is enabled
  if (!user.recoveryMethods.includes('email')) {
    return res.status(400).json({ error: 'Email recovery not enabled for this account' });
  }
  
  // 3. Create recovery token
  const { token } = await recoveryTokenService.createRecoveryToken(user.userId);
  
  // 4. Send via email
  await emailService.sendRecoveryEmail(user.email, token);
  
  res.json({ success: true, message: 'Recovery email sent' });
});
```

---

## 📊 API Endpoints

### User Management

- `POST /api/users` - Create user
- `GET /api/users/:userId` - Get user by ID
- `GET /api/users/email/:email` - Get user by email
- `PATCH /api/users/:userId` - Update user
- `DELETE /api/users/:userId` - Delete user
- `GET /api/users` - Get all users (dev only)

### Recovery Tokens

- `POST /api/recovery/request` - Request recovery token
- `POST /api/recovery/validate` - Validate recovery token
- `POST /api/recovery/revoke` - Revoke user tokens

---

## 🔐 Security Features

1. **No Password Storage**
   - Passwords handled by external authentication service
   - User store only contains identifiers

2. **Input Validation**
   - Email format validation
   - Phone number normalization
   - Recovery method validation

3. **Unique Constraints**
   - userId must be unique
   - email must be unique
   - Prevents duplicate accounts

4. **Data Normalization**
   - Email: Lowercased and trimmed
   - Phone: Normalized to digits only

---

## 🗄️ Database Migration

The user store is currently in-memory but designed for easy database migration.

**Current:** In-memory Map (development)
**Production:** PostgreSQL/MongoDB/etc. (see `docs/USER_STORE_MIGRATION.md`)

### Migration Path:

1. Choose database (PostgreSQL recommended)
2. Create schema (see `utils/userStorage.js`)
3. Replace Map operations with database queries
4. Use parameterized queries (prevent SQL injection)
5. Add connection pooling
6. Test thoroughly

---

## 📝 Example Usage

### Create User

```javascript
const user = await userService.createUser({
  userId: 'user123',
  email: 'user@example.com',
  phone: '+1234567890',
  recoveryMethods: ['email', 'phone']
});
```

### Get User

```javascript
const user = userService.getUserByEmail('user@example.com');
if (user && user.recoveryMethods.includes('email')) {
  // Send recovery email
}
```

### Update Recovery Methods

```javascript
await userService.updateUser('user123', {
  recoveryMethods: ['email', 'sms', 'totp']
});
```

---

## 🚀 Next Steps

1. **Integrate with Authentication Service:**
   - Connect to OAuth provider (Google, GitHub, etc.)
   - Or use authentication service (Auth0, Firebase Auth, etc.)
   - User store provides identity, auth service handles passwords

2. **Add Email/SMS Services:**
   - Integrate email service (SendGrid, AWS SES, etc.)
   - Integrate SMS service (Twilio, AWS SNS, etc.)
   - Use user.recoveryMethods to determine delivery method

3. **Migrate to Database:**
   - Follow migration guide
   - Set up connection pooling
   - Configure backups and monitoring

4. **Add Rate Limiting:**
   - Limit user creation
   - Limit recovery token requests
   - Prevent abuse

---

## ✅ Best Practices

- ✅ Always validate input
- ✅ Use parameterized queries (SQL injection prevention)
- ✅ Normalize data (email, phone)
- ✅ Never store passwords
- ✅ Use unique constraints
- ✅ Implement soft deletes (production)
- ✅ Log user operations
- ✅ Monitor for suspicious activity
- ✅ Regular backups
- ✅ Test database migrations on staging first
