# Environment Variables Security Best Practices

## 🔒 Security Guidelines for .env Configuration

### Overview

Environment variables are used to store sensitive configuration data. Following security best practices is critical to protect your application and data.

---

## 📋 Required Variables

### 1. **PORT**
```env
PORT=3000
```

**Security Best Practices:**
- ✅ Use ports 3000+ for development (avoid well-known ports like 80, 443, 22)
- ✅ In production, use reverse proxy (nginx, Apache) on port 80/443
- ✅ Don't hardcode ports in application code
- ✅ Document port usage in deployment guides

---

### 2. **JWT_SECRET** ⚠️ **CRITICAL SECURITY**

```env
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-change-this-immediately
```

**Security Best Practices:**

#### ✅ **DO:**
- **Generate a strong, random secret** (minimum 64 characters recommended)
  ```bash
  # Generate secure secret:
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- **Use different secrets for different environments** (dev, staging, production)
- **Store production secrets securely:**
  - Use secret management services (AWS Secrets Manager, HashiCorp Vault, Azure Key Vault)
  - Use CI/CD pipeline secrets
  - Never commit secrets to version control
- **Rotate secrets regularly** (every 90 days or after security incidents)
- **Use separate secrets for different token types** (access vs refresh tokens)

#### ❌ **DON'T:**
- Never use default or example values in production
- Never commit `.env` files to Git
- Never share secrets via email, chat, or unencrypted channels
- Never use weak secrets (common words, short strings, sequential patterns)
- Never use the same secret across multiple applications

**Minimum Requirements:**
- Length: **Minimum 32 characters** (64+ recommended)
- Complexity: Mix of letters, numbers, and special characters
- Randomness: Use cryptographically secure random generators

---

### 3. **TOKEN_EXPIRY_MINUTES**

```env
TOKEN_EXPIRY_MINUTES=60
```

**Security Best Practices:**

#### ✅ **Recommended Values:**
- **Access Tokens**: 15-60 minutes (shorter = more secure)
- **Refresh Tokens**: 7-30 days (longer = better UX)
- **Password Reset Tokens**: 15-30 minutes
- **Email Verification Tokens**: 24 hours

#### ✅ **Best Practices:**
- **Balance security vs. user experience:**
  - Shorter expiry = more secure but requires frequent re-authentication
  - Longer expiry = better UX but higher risk if token is compromised
- **Implement refresh token rotation** to extend sessions securely
- **Revoke tokens** on logout or security events
- **Use different expiry times** for different token types
- **Monitor token usage** for anomalies (unusual patterns, multiple locations)

#### ❌ **DON'T:**
- Don't use extremely long expiry (years) for access tokens
- Don't forget to implement token refresh mechanism
- Don't ignore token revocation on logout

---

### 4. **RATE_LIMIT_WINDOW**

```env
RATE_LIMIT_WINDOW=900000
```

**Units:** Milliseconds

**Security Best Practices:**

#### ✅ **Recommended Values:**
- **Development**: 60000 (1 minute) for testing
- **Production**: 900000 (15 minutes) or 3600000 (1 hour)
- **Strict APIs**: 600000 (10 minutes)

#### ✅ **Best Practices:**
- **Balance between security and usability:**
  - Shorter window = stricter but may block legitimate users
  - Longer window = more lenient but less protection
- **Adjust based on endpoint sensitivity:**
  - Login endpoints: Shorter window (5-15 minutes)
  - Public endpoints: Longer window (15-60 minutes)
  - Admin endpoints: Very short window (1-5 minutes)
- **Use sliding window** instead of fixed window when possible
- **Consider different limits** for authenticated vs. anonymous users

#### ❌ **DON'T:**
- Don't use extremely short windows (< 1 minute) for general APIs
- Don't forget to configure rate limits (defaults may be too lenient)
- Don't ignore rate limit headers in responses

---

### 5. **RATE_LIMIT_MAX**

```env
RATE_LIMIT_MAX=100
```

**Units:** Number of requests per window

**Security Best Practices:**

#### ✅ **Recommended Values:**
- **General APIs**: 100-200 requests per window
- **Authentication endpoints**: 5-10 requests per window
- **File upload endpoints**: 10-20 requests per window
- **Admin endpoints**: 50-100 requests per window
- **Public read-only**: 200-500 requests per window

#### ✅ **Best Practices:**
- **Tiered rate limiting:**
  - Anonymous users: Lower limit (50-100)
  - Authenticated users: Medium limit (100-200)
  - Premium users: Higher limit (500-1000)
- **Per-IP vs. Per-User:**
  - Use per-IP for anonymous/unauthenticated requests
  - Use per-user for authenticated requests
- **Monitor and adjust** based on actual usage patterns
- **Implement progressive delays** or temporary bans for repeat offenders
- **Provide rate limit information** in response headers:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets

#### ❌ **DON'T:**
- Don't set limits too high (defeats the purpose)
- Don't set limits too low (hurts legitimate users)
- Don't ignore distributed attacks (use Redis for shared rate limiting across servers)
- Don't forget to handle rate limit errors gracefully

---

## 🔐 General Security Best Practices

### 1. **File Management**

#### ✅ **DO:**
- ✅ **Use `.gitignore`** to exclude `.env` files
- ✅ **Commit `.env.example`** with placeholder values
- ✅ **Document all required variables** in `.env.example`
- ✅ **Use different `.env` files** for different environments
- ✅ **Validate required variables** at application startup

#### ❌ **DON'T:**
- ❌ Never commit `.env` to version control
- ❌ Never share `.env` files via insecure channels
- ❌ Never use production secrets in development

### 2. **Environment Separation**

```env
# Development
NODE_ENV=development
JWT_SECRET=dev-secret-key

# Staging
NODE_ENV=staging
JWT_SECRET=staging-secret-key

# Production
NODE_ENV=production
JWT_SECRET=<stored-in-secret-manager>
```

- ✅ **Use different secrets** for each environment
- ✅ **Separate databases** per environment
- ✅ **Different rate limits** per environment (stricter in production)

### 3. **Secret Management in Production**

#### Options:
1. **Cloud Secret Managers:**
   - AWS Secrets Manager
   - Azure Key Vault
   - Google Cloud Secret Manager
   - HashiCorp Vault

2. **CI/CD Pipeline Secrets:**
   - GitHub Secrets
   - GitLab CI/CD Variables
   - Jenkins Credentials

3. **Container Orchestration:**
   - Kubernetes Secrets
   - Docker Secrets
   - Environment variables in container configs

### 4. **Validation**

Always validate environment variables at startup:

```javascript
// Validate required environment variables
const requiredEnvVars = ['PORT', 'JWT_SECRET', 'TOKEN_EXPIRY_MINUTES'];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

// Validate JWT_SECRET strength
if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}
```

### 5. **Monitoring & Auditing**

- ✅ **Log environment variable loading** (without exposing values)
- ✅ **Monitor for unauthorized access attempts**
- ✅ **Audit secret rotations**
- ✅ **Track rate limit violations**
- ✅ **Alert on suspicious token usage patterns**

---

## 📝 Quick Reference Checklist

- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` exists with all required variables
- [ ] `JWT_SECRET` is 64+ characters, randomly generated
- [ ] Different secrets for each environment
- [ ] Production secrets stored in secret manager
- [ ] Rate limits configured appropriately
- [ ] Token expiry times balanced for security/UX
- [ ] Environment variables validated at startup
- [ ] Documentation updated for new variables

---

## 🚨 Emergency Procedures

If secrets are compromised:

1. **Immediately rotate** all affected secrets
2. **Revoke all active tokens** (force re-authentication)
3. **Review access logs** for suspicious activity
4. **Notify affected users** if personal data at risk
5. **Update incident response documentation**

---

## 📚 Additional Resources

- [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
