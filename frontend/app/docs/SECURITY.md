# Security Documentation

## 🔒 Security Measures

OCKRIX Platform implements multiple layers of security to protect users and data.

---

## 🛡️ Input Sanitization

### Overview

All user inputs are sanitized to prevent:
- **XSS (Cross-Site Scripting)** attacks
- **SQL Injection** attacks (if applicable)
- **Code Injection** attacks
- **HTML Injection** attacks

### Sanitization Functions

#### `sanitizeText(text: string)`
- Removes HTML tags
- Decodes HTML entities
- Removes control characters
- Use for: General text input

#### `sanitizeEmail(email: string)`
- Validates email format
- Removes dangerous characters
- Converts to lowercase
- Throws error if invalid
- Use for: Email input fields

#### `sanitizePhone(phone: string)`
- Removes non-numeric characters (except +)
- Validates minimum length (10 digits)
- Throws error if invalid
- Use for: Phone number input

#### `sanitizeToken(token: string)`
- Validates base64 format
- Removes invalid characters
- Validates minimum length
- Use for: Recovery tokens

#### `sanitizeHTML(html: string)`
- Removes script tags
- Removes event handlers
- Removes javascript: protocols
- Use for: HTML content display

#### `escapeHTML(text: string)`
- Escapes HTML entities
- Converts `<` to `&lt;`, `>` to `&gt;`, etc.
- Use for: Displaying user input

### Usage Example

```typescript
import { sanitizeEmail, sanitizeText } from '@/lib/security/sanitization';

// Sanitize email
try {
  const cleanEmail = sanitizeEmail(userInput);
} catch (error) {
  // Handle invalid email
}

// Sanitize text
const cleanText = sanitizeText(userInput);
```

---

## 🔐 Security Headers

### Configured Headers

The application sets the following security headers:

#### `X-Frame-Options: DENY`
- Prevents clickjacking attacks
- Prevents embedding in iframes

#### `X-Content-Type-Options: nosniff`
- Prevents MIME type sniffing
- Forces browser to respect Content-Type header

#### `X-XSS-Protection: 1; mode=block`
- Enables XSS protection in older browsers
- Blocks pages if XSS detected

#### `Referrer-Policy: strict-origin-when-cross-origin`
- Controls referrer information
- Limits information leakage

#### `Content-Security-Policy`
- Restricts resource loading
- Prevents XSS and injection attacks
- Config: `next.config.ts`

#### `Strict-Transport-Security` (Production only)
- Forces HTTPS in production
- Prevents protocol downgrade attacks
- `max-age=31536000; includeSubDomains; preload`

#### `Permissions-Policy`
- Controls browser features
- Disables unnecessary features (geolocation, camera, etc.)

### Configuration

Security headers are configured in `next.config.ts`:

```typescript
async headers() {
  return [{
    source: '/:path*',
    headers: [
      // Security headers...
    ],
  }];
}
```

---

## 🌍 Production Environment Checks

### Environment Validation

The application validates the production environment:

#### Required Checks

1. **HTTPS Enforcement**
   - Checks for HTTPS in production
   - Logs warning if HTTP detected

2. **Debug Mode**
   - Prevents debug mode in production
   - Logs error if enabled

3. **Environment Variables**
   - Validates required environment variables
   - Ensures secure configuration

### Usage

```typescript
import { validateEnvironment, isProduction } from '@/lib/security/environment';

// Validate environment
const { valid, errors } = validateEnvironment();
if (!valid) {
  console.error('Environment errors:', errors);
}

// Check if production
if (isProduction()) {
  // Production-only code
}
```

---

## 🔄 Client-Side Rate Limiting

### Overview

Prevents abuse through client-side rate limiting:

```typescript
import { ClientRateLimiter } from '@/lib/security/middleware';

const limiter = new ClientRateLimiter(60000, 10); // 10 requests per minute

if (limiter.isAllowed('user-action')) {
  // Proceed with action
} else {
  // Rate limit exceeded
}
```

---

## ✅ Best Practices

### 1. Always Sanitize Input

**❌ Bad:**
```typescript
<div>{userInput}</div>
```

**✅ Good:**
```typescript
import { sanitizeForDisplay } from '@/lib/security/sanitization';

<div>{sanitizeForDisplay(userInput)}</div>
```

### 2. Validate Before Processing

**❌ Bad:**
```typescript
const email = formData.email;
// Use directly
```

**✅ Good:**
```typescript
import { sanitizeEmail } from '@/lib/security/sanitization';

try {
  const email = sanitizeEmail(formData.email);
  // Use sanitized email
} catch (error) {
  // Handle error
}
```

### 3. Use Secure Input Component

```tsx
import SecureInput from '@/components/SecureInput';

<SecureInput
  type="email"
  value={email}
  onSanitizedChange={(sanitized) => setEmail(sanitized)}
/>
```

### 4. Validate Length

```typescript
import { validateLength } from '@/lib/security/sanitization';

if (!validateLength(input, 5, 100)) {
  // Handle invalid length
}
```

### 5. Escape HTML for Display

```typescript
import { escapeHTML } from '@/lib/security/sanitization';

const safeText = escapeHTML(userInput);
```

---

## 🚨 Security Checklist

### Development

- [x] Input sanitization implemented
- [x] Security headers configured
- [x] Environment validation
- [x] Client-side rate limiting
- [x] Secure input components
- [x] HTML escaping

### Production

- [ ] HTTPS enabled
- [ ] Security headers verified
- [ ] Environment variables set
- [ ] Debug mode disabled
- [ ] Rate limiting enabled (server-side)
- [ ] Monitoring enabled
- [ ] Security audits scheduled

---

## 🔍 Security Testing

### XSS Prevention

Test with:
```javascript
<script>alert('XSS')</script>
<img src=x onerror="alert('XSS')">
javascript:alert('XSS')
```

All should be sanitized/escaped.

### Injection Prevention

Test with:
- SQL injection attempts
- Code injection attempts
- Command injection attempts

All should be blocked.

### Header Verification

Use browser dev tools or:
```bash
curl -I https://your-domain.com
```

Verify all security headers are present.

---

## 📊 Security Monitoring

### Recommended Monitoring

1. **Failed Validation Attempts**
   - Track sanitization failures
   - Alert on patterns

2. **Rate Limit Violations**
   - Track rate limit hits
   - Identify abuse patterns

3. **Security Header Compliance**
   - Monitor header presence
   - Alert on missing headers

---

## 🔐 Additional Security Measures

### Backend Security

- Server-side validation (always)
- Rate limiting (server-side)
- Authentication/Authorization
- Audit logging
- Encryption at rest
- Secure session management

### Frontend Security

- Client-side validation (UX only)
- Input sanitization (this doc)
- Security headers (this doc)
- HTTPS enforcement (production)
- Content Security Policy
- Secure cookie flags

---

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Security Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#security)
- [Next.js Security](https://nextjs.org/docs/going-to-production#security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
