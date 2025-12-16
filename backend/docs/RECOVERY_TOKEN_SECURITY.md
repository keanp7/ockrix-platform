# Zero-Knowledge Recovery Token System - Security Documentation

## 🔒 Overview

This document explains the security architecture of the zero-knowledge recovery token system implemented in OCKRIX. The system is designed to provide secure, single-use, time-limited recovery tokens without storing any recoverable token information on the server.

---

## 🎯 Security Requirements Met

✅ **Cryptographically Secure Token Generation**  
✅ **Single-Use Enforcement**  
✅ **10-Minute Expiration**  
✅ **Token Hashing Before Storage**  
✅ **Zero-Knowledge Design (No Plain Token Storage)**

---

## 🏗️ Architecture Overview

### Request Flow

```
1. User requests recovery token
   ↓
2. Server generates cryptographically secure random token (256 bits)
   ↓
3. Server hashes token using bcrypt (with salt + key stretching)
   ↓
4. Server stores ONLY the hash + metadata (userId, expiresAt, used flag)
   ↓
5. Server sends plain token to user via secure channel (email/SMS)
   ↓
6. Plain token is removed from server memory
   ↓
7. User provides token for validation
   ↓
8. Server hashes provided token and compares with stored hash
   ↓
9. Server validates expiration and single-use status
   ↓
10. Token is marked as used (single-use enforcement)
```

---

## 🔐 Security Mechanisms Explained

### 1. Cryptographically Secure Token Generation

**Implementation:**
```javascript
const randomBytes = crypto.randomBytes(32); // 256 bits
const token = randomBytes.toString('base64url');
```

**Why It's Secure:**
- Uses `crypto.randomBytes()` - cryptographically strong pseudo-random number generator (CSPRNG)
- **Not** `Math.random()` (predictable, not secure)
- 32 bytes = 256 bits = 2^256 possible values (1.15 × 10^77)
- Even with unlimited computational resources, finding a specific token is computationally infeasible
- Each token is independently random (no pattern or predictability)

**Attack Resistance:**
- ✅ Brute force attack: Infeasible (2^256 search space)
- ✅ Pattern prediction: Impossible (true randomness)
- ✅ Token enumeration: Impossible (each token is independent)

---

### 2. Zero-Knowledge Design: Token Hashing

**Implementation:**
```javascript
const hashedToken = await bcrypt.hash(token, 12); // Cost factor 12
```

**Why It's Secure:**
- **One-way function**: Hash cannot be reversed to get original token
- **Bcrypt properties:**
  - Automatic salting (unique salt per hash)
  - Key stretching (4096 iterations with cost factor 12)
  - Slow computation (makes brute force expensive)
  
**Storage:**
- Server stores: `hash(userToken)` → `{ userId, expiresAt, used }`
- Server never stores: `userToken` (plain text)

**Attack Resistance:**
- ✅ Database compromise: Attacker gets hashes, cannot derive original tokens
- ✅ Rainbow tables: Prevented by unique salt per hash
- ✅ Brute force: Made expensive by key stretching (4096 rounds)
- ✅ Hash reversal: Impossible (one-way cryptographic function)

**Example:**
```
Token: "xK9mP2nQ7rS4tU8vW1yZ3aB5cD6eF0gH"

Stored Hash: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5cJc9.MqZdP7S"
             └─┘ └─┘ └───────────────────────────────────────────────┘
             │   │    └─ Salt + Hash (60 characters total)
             │   └─ Cost factor (2^12 = 4096 iterations)
             └─ Bcrypt version identifier
```

**Even if attacker gets hash:**
- Cannot determine original token
- Cannot create a token that hashes to this value (one-way property)
- Cannot use hash to validate tokens (must have original token)

---

### 3. Single-Use Enforcement

**Implementation:**
```javascript
if (tokenData.used) {
  return { userId: null, isValid: false }; // Token already consumed
}
tokenData.used = true; // Mark as used BEFORE returning
```

**Why It's Secure:**
- Each token can only be used once
- Prevents replay attacks (same token used multiple times)
- Critical for password reset scenarios
- Race condition protection: Token marked as used atomically

**Attack Resistance:**
- ✅ Replay attacks: Prevented (token marked used after first validation)
- ✅ Token reuse: Prevented (used flag checked before validation)
- ✅ Race conditions: Mitigated (flag set before response)

**Flow:**
```
1. Token created: used = false
2. First validation: used = false → Mark used = true → Return success
3. Second validation: used = true → Return invalid
```

---

### 4. Time-Based Expiration (10 Minutes)

**Implementation:**
```javascript
const expiresAt = new Date(createdAt.getTime() + 10 * 60 * 1000); // 10 minutes
if (now > tokenData.expiresAt) {
  return { userId: null, isValid: false }; // Expired
}
```

**Why It's Secure:**
- Limits attack window if token is intercepted
- Balances security (shorter = better) with usability
- Automatic invalidation of old tokens
- Prevents long-term token replay attacks

**Attack Resistance:**
- ✅ Token interception: Limited damage (only valid for 10 minutes)
- ✅ Old token reuse: Prevented (expiration check)
- ✅ Long-term attacks: Mitigated (tokens expire quickly)

**Recommendations:**
- 10 minutes: Good balance for password reset
- 5 minutes: Stricter security
- 15 minutes: More user-friendly (less strict)

---

### 5. Constant-Time Comparison

**Implementation:**
```javascript
const isMatch = await bcrypt.compare(plainToken, storedHashedToken);
```

**Why It's Secure:**
- Comparison time doesn't depend on where mismatch occurs
- Prevents timing attacks
- Always compares full length
- No information leakage through timing

**Timing Attack Prevention:**
```
❌ INSECURE (timing leak):
if (token.charAt(0) !== stored.charAt(0)) return false;  // Fast if first char wrong
if (token.charAt(1) !== stored.charAt(1)) return false;  // Slower if first char matches
// Attacker can determine which characters match by measuring time

✅ SECURE (constant-time):
bcrypt.compare(token, storedHash); // Always takes same time regardless of match location
```

---

## 🔍 Security Analysis

### Attack Scenarios

#### 1. Database Compromise
**Scenario:** Attacker gains access to database containing token hashes

**Protection:**
- ✅ Hashes cannot be reversed to get original tokens
- ✅ Each hash has unique salt (prevents rainbow table attacks)
- ✅ Brute force is computationally expensive (4096 iterations)

**Result:** Attacker cannot use compromised hashes to create valid tokens

---

#### 2. Token Interception
**Scenario:** Token intercepted during transmission (email/SMS compromise)

**Protection:**
- ✅ Token expires after 10 minutes (limited window)
- ✅ Single-use enforcement (cannot reuse if already consumed)
- ✅ Token is cryptographically random (cannot be predicted)

**Mitigation:**
- Use HTTPS/TLS for all communications
- Send tokens via multiple channels (email + SMS)
- Notify user when recovery token is used

**Result:** Attacker has limited time to use token, and it can only be used once

---

#### 3. Brute Force Attack
**Scenario:** Attacker tries to guess valid tokens

**Protection:**
- ✅ 256-bit tokens (2^256 possible values)
- ✅ Cryptographically secure randomness
- ✅ No pattern or predictability

**Calculation:**
```
Search space: 2^256 ≈ 1.15 × 10^77
Even at 1 billion guesses/second: 3.6 × 10^60 years
Age of universe: ~13.8 billion years

Result: Computationally infeasible
```

---

#### 4. Replay Attack
**Scenario:** Attacker captures valid token and tries to reuse it

**Protection:**
- ✅ Single-use flag (token marked as used after validation)
- ✅ Token cannot be validated again once used
- ✅ Expiration limits reuse window

**Result:** Token can only be used once, preventing replay attacks

---

#### 5. Timing Attack
**Scenario:** Attacker measures response time to determine token validity

**Protection:**
- ✅ Constant-time comparison (bcrypt.compare)
- ✅ Response time doesn't reveal validity
- ✅ Same response format for all failures

**Result:** Timing attacks are prevented

---

## 📊 Security Properties Summary

| Property | Implementation | Security Level |
|----------|---------------|----------------|
| Token Generation | `crypto.randomBytes(32)` | ✅ Cryptographically Secure |
| Token Storage | Bcrypt hash (cost 12) | ✅ Zero-Knowledge |
| Single-Use | Boolean flag | ✅ Enforced |
| Expiration | 10-minute TTL | ✅ Time-Limited |
| Comparison | `bcrypt.compare()` | ✅ Constant-Time |
| Salt | Automatic (bcrypt) | ✅ Unique Per Hash |
| Key Stretching | 4096 iterations | ✅ Brute Force Resistant |

---

## 🚀 Usage Guidelines

### Creating Tokens

```javascript
const { token, expiresAt } = await recoveryTokenService.createRecoveryToken(userId);

// SECURITY: Send token via secure channel (email/SMS)
// Never include in API response in production
await emailService.sendRecoveryEmail(userId, token);
```

### Validating Tokens

```javascript
const { userId, isValid } = await recoveryTokenService.validateRecoveryToken(token);

if (!isValid) {
  // Token is invalid, expired, or already used
  // Don't reveal which reason (prevents information leakage)
  return errorResponse();
}

// Token is valid and now consumed (single-use)
// Proceed with recovery operation
```

---

## ⚠️ Security Best Practices

### DO:
- ✅ Send tokens via secure channels (HTTPS email, encrypted SMS)
- ✅ Use HTTPS/TLS for all API communications
- ✅ Log token usage (without logging plain tokens)
- ✅ Notify users when recovery tokens are created/used
- ✅ Revoke old tokens when new ones are created
- ✅ Clean up expired tokens regularly
- ✅ Use different secrets per environment
- ✅ Monitor for suspicious patterns (many token requests)

### DON'T:
- ❌ Never log plain tokens
- ❌ Never include tokens in URLs (use POST body)
- ❌ Never store plain tokens in database
- ❌ Never send tokens via insecure channels
- ❌ Never reuse the same token
- ❌ Never extend expiration without user request
- ❌ Never skip single-use validation
- ❌ Never reveal why validation failed (invalid vs expired vs used)

---

## 🔄 Production Recommendations

### Database Migration

Replace in-memory storage with database:

```sql
CREATE TABLE recovery_tokens (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  INDEX idx_user_id (user_id),
  INDEX idx_token_hash (token_hash),
  INDEX idx_expires_at (expires_at)
);
```

### Redis Alternative (High Volume)

For high-traffic applications, consider Redis:

```javascript
// Automatic expiration via TTL
await redis.setex(
  `recovery_token:${hashedToken}`,
  600, // 10 minutes in seconds
  JSON.stringify({ userId, createdAt, expiresAt, used })
);
```

### Rate Limiting

Add rate limiting to token creation endpoint:

```javascript
const rateLimit = require('express-rate-limit');

const recoveryRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3 // 3 requests per 15 minutes
});

router.post('/request', recoveryRateLimit, controller.requestRecoveryToken);
```

---

## 📚 References

- [OWASP Password Reset Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)
- [NIST Digital Identity Guidelines](https://pages.nist.gov/800-63-3/)
- [Bcrypt Algorithm](https://en.wikipedia.org/wiki/Bcrypt)
- [Cryptographically Secure Pseudorandom Number Generator](https://en.wikipedia.org/wiki/Cryptographically_secure_pseudorandom_number_generator)

---

## ✅ Security Checklist

- [x] Cryptographically secure token generation
- [x] Token hashing before storage (bcrypt)
- [x] Single-use enforcement
- [x] 10-minute expiration
- [x] Constant-time comparison
- [x] Zero-knowledge design (no plain token storage)
- [x] Automatic salt generation
- [x] Key stretching (4096 iterations)
- [x] Race condition protection
- [x] Expired token cleanup

**System is production-ready from a cryptographic security perspective.**
