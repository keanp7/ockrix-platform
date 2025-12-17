# OCKRIX Frontend Deployment Guide

## 📋 Overview

This guide covers deploying the OCKRIX frontend to Vercel.

---

## 🚀 Prerequisites

1. **Git Repository**
   - Code pushed to GitHub, GitLab, or Bitbucket
   - Repository is accessible

2. **Vercel Account**
   - Sign up at [vercel.com](https://vercel.com)
   - Connect your Git provider

3. **Backend URL**
   - Backend deployed and accessible
   - Backend URL ready for frontend configuration

---

## 📦 Vercel Deployment

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub/GitLab/Bitbucket
3. Authorize Vercel to access your repositories

### Step 2: Import Project

1. Click **"Add New..."** → **"Project"**
2. Select your repository containing OCKRIX frontend
3. Vercel will auto-detect Next.js

### Step 3: Configure Project Settings

**Framework Preset**: Next.js (auto-detected)

**Root Directory**: `./frontend` (if frontend is in subdirectory) or `./` (if at root)

**Build and Output Settings**:
- **Build Command**: `npm run build` (or `npm ci && npm run build`)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (or `npm ci`)

### Step 4: Configure Environment Variables

Go to **Environment Variables** section and add:

#### Required Variables

```
NEXT_PUBLIC_BASE_URL=https://your-frontend.vercel.app
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

#### Optional Variables

```
NODE_ENV=production
```

**Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

### Step 5: Deploy

1. Click **"Deploy"**
2. Vercel will:
   - Install dependencies
   - Build the application
   - Deploy to production
3. Wait for deployment to complete (usually 2-3 minutes)
4. Your app will be available at: `https://your-project.vercel.app`

### Step 6: Configure Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your domain
3. Update DNS records as instructed by Vercel
4. SSL certificate is automatically provisioned

---

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_BASE_URL` | Frontend URL | `https://ockrix.vercel.app` |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://ockrix-backend.railway.app` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |

### Setting Environment Variables

**In Vercel Dashboard:**
1. Go to **Settings** → **Environment Variables**
2. Add variables for:
   - **Production**
   - **Preview** (optional)
   - **Development** (optional)
3. Click **Save**

**Via CLI:**
```bash
vercel env add NEXT_PUBLIC_API_URL production
```

---

## 🔗 Connecting Backend

### Update API URL

1. Set `NEXT_PUBLIC_API_URL` environment variable in Vercel
2. Update API calls in your code to use this variable:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
```

### CORS Configuration

Ensure your backend allows requests from your Vercel domain:

```env
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-custom-domain.com
```

### API Rewrites (Optional)

You can use Vercel rewrites to proxy API requests:

**vercel.json:**
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend.railway.app/api/:path*"
    }
  ]
}
```

This allows using `/api/...` instead of full backend URL.

---

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys:
- **Production**: On push to main/master branch
- **Preview**: On every push to other branches

### Manual Deployments

1. Go to **Deployments** tab
2. Click **"..."** → **"Redeploy"**
3. Select environment (Production/Preview)

---

## 📊 Monitoring

### Vercel Dashboard

- **Deployments**: View all deployments
- **Analytics**: View performance metrics
- **Logs**: View application logs
- **Speed Insights**: View performance insights

### Access Logs

1. Go to **Deployments**
2. Click on a deployment
3. Click **"Functions"** tab to see function logs
4. Use **"Runtime Logs"** for real-time logs

---

## 🐛 Troubleshooting

### Build Fails

1. **Check Node.js Version**
   - Vercel uses Node.js 18.x by default
   - Can specify in `package.json`:
     ```json
     {
       "engines": {
         "node": ">=18.0.0"
       }
     }
     ```

2. **Check Build Logs**
   - View detailed error in deployment logs
   - Common issues:
     - Missing environment variables
     - TypeScript errors
     - Missing dependencies

3. **Verify Build Command**
   - Should be `npm run build`
   - Check `package.json` scripts

### Environment Variables Not Working

1. **Check Variable Names**
   - Browser variables must start with `NEXT_PUBLIC_`
   - Server-only variables don't need prefix

2. **Redeploy After Changes**
   - Environment variable changes require redeploy
   - Variables are injected at build time

3. **Verify Variable Values**
   - Check for typos
   - Ensure no extra spaces

### API Connection Issues

1. **Check CORS Configuration**
   - Verify backend allows Vercel domain
   - Check `ALLOWED_ORIGINS` in backend

2. **Check API URL**
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Ensure backend is accessible

3. **Check Network Tab**
   - View browser console for errors
   - Check Network tab for failed requests

### Performance Issues

1. **Enable Analytics**
   - Use Vercel Analytics for insights
   - Monitor Core Web Vitals

2. **Optimize Images**
   - Use Next.js Image component
   - Optimize image sizes

3. **Check Bundle Size**
   - Use `npm run build` to see bundle analysis
   - Remove unused dependencies

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] All environment variables are set
- [ ] `NEXT_PUBLIC_API_URL` points to production backend
- [ ] CORS is properly configured on backend
- [ ] Security headers are configured (in `next.config.ts`)
- [ ] No sensitive data in client-side code
- [ ] HTTPS is enabled (automatic on Vercel)
- [ ] Custom domain SSL is configured
- [ ] Analytics/monitoring is set up

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 🔄 Deployment Workflow

### Typical Workflow

1. **Development**
   - Make changes locally
   - Test with `npm run dev`
   - Commit to feature branch

2. **Preview Deployment**
   - Push to feature branch
   - Vercel creates preview deployment
   - Test preview URL

3. **Production Deployment**
   - Merge to main branch
   - Vercel automatically deploys to production
   - Verify production URL

### Rollback

If deployment has issues:

1. Go to **Deployments** tab
2. Find last working deployment
3. Click **"..."** → **"Promote to Production"**

This instantly rolls back to previous version.
