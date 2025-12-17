# OCKRIX Platform Deployment Guide

## 📋 Overview

Complete deployment guide for OCKRIX Platform:
- **Backend**: Deploy to Render or Railway
- **Frontend**: Deploy to Vercel

---

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐
│   Frontend  │────────▶│   Backend    │
│   (Vercel)  │  API    │ (Railway/    │
│             │  Calls  │   Render)    │
└─────────────┘         └──────────────┘
```

---

## 📦 Prerequisites

1. **Git Repository**
   - Backend and frontend code in repository
   - Repository accessible on GitHub/GitLab/Bitbucket

2. **Accounts**
   - Vercel account ([vercel.com](https://vercel.com))
   - Render account ([render.com](https://render.com)) OR
   - Railway account ([railway.app](https://railway.app))

3. **Domain (Optional)**
   - Custom domain for production
   - DNS access for domain configuration

---

## 🚀 Quick Start

### 1. Deploy Backend First

Choose one:
- [Render Deployment](./backend/DEPLOYMENT.md#-render-deployment)
- [Railway Deployment](./backend/DEPLOYMENT.md#-railway-deployment)

**Important**: Note your backend URL after deployment (e.g., `https://ockrix-backend.railway.app`)

### 2. Deploy Frontend

- [Vercel Deployment](./frontend/DEPLOYMENT.md)

Use the backend URL from step 1 in frontend environment variables.

---

## 🔐 Environment Variables Setup

### Backend Environment Variables

Set these in Render/Railway dashboard:

**Required:**
```bash
NODE_ENV=production
PORT=3000  # or 10000 for Render
JWT_SECRET=<generate-secure-secret>
```

**Optional:**
```bash
TOKEN_EXPIRY_MINUTES=60
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

See [backend/.env.production.example](./backend/.env.production.example) for full list.

### Frontend Environment Variables

Set these in Vercel dashboard:

**Required:**
```bash
NEXT_PUBLIC_BASE_URL=https://your-frontend.vercel.app
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

See [frontend/.env.production.example](./frontend/.env.production.example) for full list.

---

## 📝 Step-by-Step Deployment

### Backend Deployment

#### Option A: Render

1. **Create Account**: [render.com](https://render.com)
2. **Create Web Service**:
   - Connect repository
   - Select backend folder
   - Build: `npm install`
   - Start: `npm start`
3. **Set Environment Variables** (see above)
4. **Deploy**: Click "Create Web Service"
5. **Note Backend URL**: e.g., `https://ockrix-backend.onrender.com`

See [backend/DEPLOYMENT.md](./backend/DEPLOYMENT.md) for detailed steps.

#### Option B: Railway

1. **Create Account**: [railway.app](https://railway.app)
2. **Create Project**:
   - Deploy from GitHub repo
   - Select backend folder
3. **Set Environment Variables** (see above)
4. **Deploy**: Automatic on push
5. **Note Backend URL**: Check Settings → Networking

See [backend/DEPLOYMENT.md](./backend/DEPLOYMENT.md) for detailed steps.

### Frontend Deployment

1. **Create Vercel Account**: [vercel.com](https://vercel.com)
2. **Import Project**:
   - Connect repository
   - Select frontend folder
   - Framework: Next.js (auto-detected)
3. **Set Environment Variables**:
   - `NEXT_PUBLIC_BASE_URL`: Your Vercel URL
   - `NEXT_PUBLIC_API_URL`: Your backend URL from step above
4. **Deploy**: Click "Deploy"
5. **Verify**: Test frontend → backend connection

See [frontend/DEPLOYMENT.md](./frontend/DEPLOYMENT.md) for detailed steps.

---

## ✅ Post-Deployment Checklist

### Backend

- [ ] Backend is accessible at provided URL
- [ ] `/health` endpoint returns 200 OK
- [ ] Environment variables are set correctly
- [ ] CORS allows frontend domain
- [ ] Logs are accessible
- [ ] Monitoring is set up

### Frontend

- [ ] Frontend is accessible at Vercel URL
- [ ] Environment variables are set
- [ ] Frontend can connect to backend
- [ ] All API calls work correctly
- [ ] Custom domain is configured (if applicable)
- [ ] SSL certificate is active

### Integration

- [ ] Frontend → Backend API calls work
- [ ] Recovery flow works end-to-end
- [ ] CORS is properly configured
- [ ] Error handling works correctly
- [ ] Logs show no errors

---

## 🔒 Security Checklist

- [ ] `NODE_ENV=production` is set
- [ ] Strong `JWT_SECRET` is generated (64+ characters)
- [ ] All secrets are in environment variables (not code)
- [ ] HTTPS is enabled (automatic on all platforms)
- [ ] CORS is restricted to frontend domain
- [ ] Security headers are configured
- [ ] Rate limiting is enabled
- [ ] No sensitive data in client-side code
- [ ] Custom domains have SSL certificates

---

## 🔄 Continuous Deployment

### Automatic Deploys

All platforms support automatic deployments:

- **Backend (Render/Railway)**: Deploys on push to main branch
- **Frontend (Vercel)**: Deploys on push to main branch (production) or other branches (preview)

### Manual Deploys

- **Render**: Click "Manual Deploy" → "Clear build cache & deploy"
- **Railway**: Click "Redeploy" in deployments
- **Vercel**: Click "Redeploy" in deployments

---

## 🐛 Troubleshooting

### Backend Issues

**Build Fails:**
- Check Node.js version (requires 18+)
- Verify `package.json` is correct
- Check build logs for errors

**Application Won't Start:**
- Verify environment variables are set
- Check `JWT_SECRET` is set
- Verify `PORT` is correct
- Check logs for startup errors

**Health Check Fails:**
- Verify `/health` endpoint works locally
- Check application is listening on correct port

### Frontend Issues

**Build Fails:**
- Check Node.js version
- Verify all dependencies are in `package.json`
- Check TypeScript errors

**API Connection Issues:**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS configuration on backend
- Ensure backend is accessible
- Check browser console for errors

**Environment Variables Not Working:**
- Variables must start with `NEXT_PUBLIC_` to be exposed to browser
- Redeploy after changing environment variables
- Check for typos in variable names

### Integration Issues

**CORS Errors:**
- Add frontend URL to `ALLOWED_ORIGINS` on backend
- Verify CORS middleware is configured correctly
- Check backend logs for CORS errors

**API Calls Fail:**
- Verify backend URL is correct
- Check backend is running and accessible
- Verify API endpoints are correct
- Check network tab in browser

---

## 📊 Monitoring

### Backend Monitoring

- **Render**: Metrics and logs in dashboard
- **Railway**: Metrics and logs in dashboard

### Frontend Monitoring

- **Vercel**: Analytics, Speed Insights, and logs in dashboard

### Health Checks

Both platforms use health check endpoints:
- **Backend**: `/health`
- Configured automatically

---

## 🔄 Updates and Maintenance

### Updating Backend

1. Make changes locally
2. Test locally
3. Commit and push to repository
4. Platform automatically deploys
5. Verify deployment in logs

### Updating Frontend

1. Make changes locally
2. Test locally with `npm run dev`
3. Commit and push to repository
4. Vercel automatically deploys
5. Verify deployment works

### Rolling Back

**Render:**
- Go to Deployments → Find previous deployment → Click "Rollback"

**Railway:**
- Go to Deployments → Find previous deployment → Click "Promote"

**Vercel:**
- Go to Deployments → Find previous deployment → Click "Promote to Production"

---

## 📚 Additional Resources

### Documentation

- [Backend Deployment](./backend/DEPLOYMENT.md)
- [Frontend Deployment](./frontend/DEPLOYMENT.md)
- [Security Documentation](./frontend/app/docs/SECURITY.md)

### Platform Docs

- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## 🆘 Support

If you encounter issues:

1. Check platform logs for errors
2. Verify environment variables
3. Test endpoints manually (health check, API)
4. Check platform status pages
5. Review troubleshooting sections in this guide
