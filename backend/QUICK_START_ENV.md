# Quick Start: Environment Configuration

## 🚀 Setup Steps

1. **Copy the template:**
   ```bash
   cp .env.example .env
   ```

2. **Generate a secure JWT secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   Copy the output and set it as `JWT_SECRET` in your `.env` file.

3. **Update `.env` with your values:**
   ```env
   PORT=3000
   JWT_SECRET=<paste-generated-secret-here>
   TOKEN_EXPIRY_MINUTES=60
   RATE_LIMIT_WINDOW=900000
   RATE_LIMIT_MAX=100
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

The server will validate all environment variables on startup and show clear error messages if anything is misconfigured.

---

## ⚠️ Security Checklist

Before deploying to production:

- [ ] `.env` is in `.gitignore` ✅ (already configured)
- [ ] `JWT_SECRET` is 64+ characters, randomly generated
- [ ] `JWT_SECRET` is NOT the example value
- [ ] Production secrets stored in secret manager (AWS Secrets Manager, etc.)
- [ ] Different secrets for dev/staging/production
- [ ] `NODE_ENV=production` set in production
- [ ] Rate limits adjusted for production traffic

---

## 📚 Full Documentation

See `ENV_SECURITY.md` for comprehensive security best practices and guidelines.
