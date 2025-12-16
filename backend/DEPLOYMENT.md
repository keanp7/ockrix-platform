# OCKRIX Backend Deployment Guide

## 📋 Overview

This guide covers deploying the OCKRIX backend to Render or Railway.

---

## 🚀 Deployment Options

### Option 1: Render.com

Render is a cloud platform that automatically deploys from your Git repository.

### Option 2: Railway.app

Railway is a deployment platform that makes it easy to deploy applications.

---

## 📦 Prerequisites

1. **Git Repository**
   - Code pushed to GitHub, GitLab, or Bitbucket
   - Repository is accessible

2. **Node.js Version**
   - Backend requires Node.js 18+ (recommended: Node.js 20)

3. **Environment Variables**
   - All required environment variables prepared
   - See `.env.example` for reference

---

## 🔧 Render Deployment

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub/GitLab/Bitbucket
3. Verify your email

### Step 2: Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your repository
3. Select the repository containing OCKRIX backend
4. Configure service:
   - **Name**: `ockrix-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main` or `master`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Starter` (or higher for production)

### Step 3: Configure Environment Variables

In Render dashboard, go to **Environment** tab and add:

```
NODE_ENV=production
PORT=10000
JWT_SECRET=<generate-a-secure-random-secret>
TOKEN_EXPIRY_MINUTES=60
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Start the application
3. Wait for deployment to complete
4. Your backend will be available at: `https://ockrix-backend.onrender.com`

### Step 5: Configure Custom Domain (Optional)

1. Go to **Settings** → **Custom Domain**
2. Add your domain
3. Update DNS records as instructed

---

## 🚂 Railway Deployment

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Authorize Railway to access your repositories

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Select the repository containing OCKRIX backend
4. Railway will auto-detect Node.js

### Step 3: Configure Environment Variables

1. Go to **Variables** tab
2. Add environment variables:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=<generate-a-secure-random-secret>
TOKEN_EXPIRY_MINUTES=60
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 4: Configure Build Settings

Railway should auto-detect, but verify:
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check**: `/health`

### Step 5: Deploy

1. Railway will automatically deploy on push to main branch
2. Check **Deployments** tab for status
3. Your backend URL will be shown in **Settings** → **Networking**

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `3000` or `10000` |
| `JWT_SECRET` | JWT signing secret | `generated-secret` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TOKEN_EXPIRY_MINUTES` | Token expiry | `60` |
| `RATE_LIMIT_WINDOW` | Rate limit window (ms) | `900000` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `*` (dev) |

### Generate Secure Secrets

**JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Save output to environment variable**

---

## 🏥 Health Check

The backend exposes a health check endpoint:

```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-15T10:00:00.000Z",
  "uptime": 3600
}
```

Both Render and Railway use this endpoint for health checks.

---

## 📊 Monitoring

### Render

- View logs in **Logs** tab
- Monitor metrics in **Metrics** tab
- Set up alerts in **Alerts** tab

### Railway

- View logs in **Deployments** → **Logs**
- Monitor metrics in **Metrics** tab
- Set up notifications in **Settings**

---

## 🔄 Continuous Deployment

### Automatic Deploys

Both platforms support automatic deployments:

- **Render**: Deploys on push to connected branch
- **Railway**: Deploys on push to default branch

### Manual Deploys

- **Render**: Click **"Manual Deploy"** → **"Clear build cache & deploy"**
- **Railway**: Push to repository or click **"Redeploy"**

---

## 🐛 Troubleshooting

### Build Fails

1. Check Node.js version (requires 18+)
2. Verify `package.json` is correct
3. Check build logs for errors
4. Ensure all dependencies are in `package.json`

### Application Won't Start

1. Check environment variables are set
2. Verify `JWT_SECRET` is set
3. Check logs for startup errors
4. Verify `PORT` is correct (Render uses `PORT`, Railway uses `PORT`)

### Health Check Fails

1. Verify `/health` endpoint is working locally
2. Check application is listening on correct port
3. Verify no firewall blocking requests
4. Check logs for errors

### CORS Issues

1. Set `ALLOWED_ORIGINS` environment variable
2. Update CORS configuration in `middleware/cors.js`
3. Verify frontend URL is in allowed origins

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] `NODE_ENV=production` is set
- [ ] Strong `JWT_SECRET` is generated and set
- [ ] All sensitive variables are in environment (not code)
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] HTTPS is enabled (automatic on Render/Railway)
- [ ] Health check endpoint is working
- [ ] Logs are monitored

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
