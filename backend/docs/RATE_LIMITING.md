# Rate Limiting Configuration

## 📋 Overview

Rate limiting middleware protects recovery endpoints from brute-force attacks and abuse by limiting the number of requests from a single IP address within a time window.

---

## 🔒 Security Benefits

✅ **Brute-Force Protection** - Prevents rapid successive attempts  
✅ **Abuse Prevention** - Limits automated attacks  
✅ **Resource Protection** - Prevents server overload  
✅ **Clear Error Messages** - Informs users when limits are exceeded  

---

## ⚙️ Rate Limit Configuration

### Recovery Start & Request Endpoints

**Endpoint**: `POST /api/recovery/start`, `POST /api/recovery/request`

**Configuration**:
- **Window**: 15 minutes
- **Max Requests**: 5 per 15 minutes
- **Limiter**: `recoveryRateLimiter`

**Rationale**: Very strict limits prevent attackers from rapidly trying different email/phone combinations to enumerate users or exhaust resources.

### Verification Endpoint

**Endpoint**: `POST /api/recovery/verify`

**Configuration**:
- **Window**: 15 minutes
- **Max Requests**: 10 per 15 minutes
- **Limiter**: `verificationRateLimiter`

**Rationale**: Moderate limits allow legitimate users to retry while preventing abuse.

### Token Operations

**Endpoints**: `POST /api/recovery/validate`, `POST /api/recovery/complete`, `POST /api/recovery/revoke`

**Configuration**:
- **Window**: 15 minutes
- **Max Requests**: 20 per 15 minutes
- **Limiter**: `tokenOperationRateLimiter`

**Rationale**: Standard limits for token validation and completion operations.

---

## 📊 Rate Limit Headers

Responses include rate limit information in headers:

```
RateLimit-Limit: 5
RateLimit-Remaining: 3
RateLimit-Reset: 1702569600
```

- **RateLimit-Limit**: Maximum number of requests allowed
- **RateLimit-Remaining**: Number of requests remaining in window
- **RateLimit-Reset**: Unix timestamp when limit resets

---

## ⚠️ Rate Limit Exceeded Response

When rate limit is exceeded, the API returns:

**Status Code**: `429 Too Many Requests`

**Response Body**:
```json
{
  "success": false,
  "error": "Too many recovery attempts. Please wait 15 minutes before trying again.",
  "retryAfter": 900,
  "limit": 5,
  "window": 900
}
```

- **error**: Clear message explaining the limit
- **retryAfter**: Seconds until limit resets
- **limit**: Maximum requests allowed
- **window**: Time window in seconds

---

## 🔧 Configuration via Environment Variables

Rate limits can be configured via environment variables:

```env
# Rate limiting configuration
RATE_LIMIT_WINDOW=900000    # 15 minutes in milliseconds
RATE_LIMIT_MAX=100          # General API limit (not used for recovery endpoints)
```

**Note**: Recovery endpoints use hardcoded strict limits for security. Only general API limits are configurable via environment variables.

---

## 📝 Custom Rate Limiters

### Create Custom Rate Limiter

```javascript
const { createCustomRateLimiter } = require('./middleware/rateLimiter');

const customLimiter = createCustomRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: 'Custom rate limit message'
});

router.post('/endpoint', customLimiter, controller);
```

### Pre-configured Limiters

```javascript
const {
  recoveryRateLimiter,        // 5 req/15min - Very strict
  verificationRateLimiter,    // 10 req/15min - Moderate
  tokenOperationRateLimiter,  // 20 req/15min - Standard
  strictRateLimiter,          // 3 req/hour - Very strict
  generalRateLimiter,         // 100 req/15min - General API
  failureBasedRateLimiter     // 10 failures/15min - Counts only failures
} = require('./middleware/rateLimiter');
```

---

## 🔍 How Rate Limiting Works

### 1. Request Tracking

- Each request is tracked by IP address (from `req.ip`)
- Works behind reverse proxies (trust proxy enabled)
- Falls back to `req.connection.remoteAddress` if IP unavailable

### 2. Window-Based Limiting

- Time window: Fixed duration (e.g., 15 minutes)
- Sliding window: Limit resets continuously
- Example: If limit is 5 per 15 minutes, after 15 minutes from first request, the count resets

### 3. Request Counting

- All requests are counted by default
- Can be configured to count only successes or only failures
- Each endpoint uses independent counters

### 4. Response Headers

Rate limit information included in every response:
- `RateLimit-Limit`: Maximum allowed
- `RateLimit-Remaining`: Remaining requests
- `RateLimit-Reset`: Reset timestamp

---

## 🛡️ Security Considerations

### 1. IP-Based Limiting

**Pros**:
- Simple and effective
- Works without authentication
- Prevents automated attacks

**Limitations**:
- Users behind shared IPs (NAT, corporate networks) share limits
- VPN users may share IP addresses
- IP spoofing (mitigated by trust proxy configuration)

### 2. Trust Proxy

The server is configured with `app.set('trust proxy', 1)` to correctly identify client IPs when behind reverse proxies (nginx, load balancers, etc.).

### 3. Rate Limit Logging

Rate limit violations are logged for security monitoring:
```javascript
logger.warn('Rate limit exceeded', {
  ip: req.ip,
  path: req.path,
  method: req.method,
  userAgent: req.get('user-agent'),
  timestamp: new Date().toISOString()
});
```

### 4. Error Messages

Error messages are clear but don't reveal:
- Exact limit values (users shouldn't know exact thresholds)
- Time remaining (retryAfter provides this in a standard way)
- Internal rate limit logic

---

## 🚀 Production Recommendations

### 1. Use Redis for Distributed Rate Limiting

For multiple server instances, use Redis-based rate limiting:

```javascript
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL
});

const rateLimiter = rateLimit({
  store: new RedisStore({
    client: client,
    prefix: 'rl:recovery:'
  }),
  windowMs: 15 * 60 * 1000,
  max: 5
});
```

### 2. Adjust Limits Based on Risk

Consider dynamic rate limiting based on:
- User authentication status (higher limits for authenticated users)
- Risk scoring (stricter limits for high-risk IPs)
- Geographic location (different limits by region)

### 3. Implement Progressive Delays

Instead of hard blocking, consider progressive delays:
- First violation: 5 second delay
- Second violation: 30 second delay
- Third violation: 5 minute delay
- Fourth violation: Blocked

### 4. Whitelist Trusted IPs

For internal/admin tools, whitelist trusted IPs:

```javascript
const rateLimiter = rateLimit({
  skip: (req) => {
    const trustedIPs = ['192.168.1.100', '10.0.0.1'];
    return trustedIPs.includes(req.ip);
  },
  // ... rest of config
});
```

### 5. Monitor Rate Limit Violations

Track rate limit violations for:
- Security incident detection
- Identifying attack patterns
- Adjusting limits based on legitimate usage

---

## 📈 Monitoring

### Track Rate Limit Metrics

Monitor:
- Number of rate limit violations per endpoint
- IP addresses hitting limits
- Time patterns (e.g., attacks during off-hours)
- Geographic distribution of violations

### Alerting

Set up alerts for:
- Sudden spike in rate limit violations
- Single IP hitting multiple endpoints
- Sustained attack patterns

---

## ✅ Best Practices

1. **Strict Limits for Sensitive Operations**
   - Recovery start: Very strict (5/15min)
   - Verification: Moderate (10/15min)
   - Token operations: Standard (20/15min)

2. **Clear Error Messages**
   - Explain why limit was exceeded
   - Provide retry time
   - Don't reveal internal limits

3. **Log Violations**
   - Log all rate limit violations
   - Include IP, path, timestamp
   - Monitor for attack patterns

4. **Use Standard Headers**
   - Include RateLimit-* headers
   - Follow RFC 6585 for 429 responses
   - Provide retryAfter information

5. **Test Rate Limits**
   - Verify limits work correctly
   - Test error messages
   - Confirm headers are included

---

## 🔄 Bypassing Rate Limits (Development)

For development/testing, you can temporarily disable rate limiting:

```javascript
// Development mode: Skip rate limiting
if (process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMIT === 'true') {
  router.post('/start', recoveryTokenController.startRecovery);
} else {
  router.post('/start', recoveryRateLimiter, recoveryTokenController.startRecovery);
}
```

**⚠️ Never disable in production!**

---

## 📚 References

- [express-rate-limit Documentation](https://github.com/express-rate-limit/express-rate-limit)
- [RFC 6585 - Additional HTTP Status Codes](https://tools.ietf.org/html/rfc6585#section-4)
- [OWASP - Brute Force Attack](https://owasp.org/www-community/attacks/Brute_force_attack)
