# OCKRIX Platform

**Recover Account Access. Securely. Globally.**

AI-powered, zero-knowledge account recovery platform with multi-language support and subscription-based pricing.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Stripe account (for payments)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment variables
cp env.example .env
# Edit .env with your values (DATABASE_URL, JWT_SECRET, STRIPE keys)

# Setup database
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Start development server
npm run dev
```

Backend runs on `http://localhost:3000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp env.example .env.local
# Edit .env.local with your values (NEXT_PUBLIC_API_URL, STRIPE key)

# Start development server
npm run dev
```

Frontend runs on `http://localhost:3001`

## 📋 Features

### Architecture Notes

**Avatar & AI Presenter Exclusion:** OCKRIX intentionally excludes avatars, AI presenters, talking heads, and video uploads from the early-stage product. This design decision prioritizes trust, speed, and security over visual AI features. The interface maintains a bank-grade, fintech-focused appearance with static hero sections, subtle gradients, and security-focused copy.

### ✅ Completed

- **Authentication System**
  - User registration & login (JWT)
  - Password reset using recovery tokens
  - Session management

- **Recovery System**
  - Zero-knowledge recovery tokens
  - Email & phone recovery
  - AI risk scoring (mock)
  - Single-use, time-limited tokens

- **Frontend Pages**
  - Landing page (white theme, video hero placeholder)
  - Pricing page (4 tiers: Free, Basic, Pro, Business)
  - Login/Signup pages
  - Password recovery page
  - Dashboard (account list & recovery status)

- **Backend Infrastructure**
  - Prisma ORM with PostgreSQL
  - Stripe integration service
  - Plan enforcement middleware
  - Rate limiting
  - Audit logging

- **Design System**
  - Fintech white theme
  - Teal → Blue → Purple gradient
  - Responsive, accessible UI

### 🚧 In Progress / TODO

- **Multi-language Support**
  - next-intl setup complete
  - Need translations for all 10+ languages

- **Account Vault**
  - Database models ready
  - Need API routes & frontend pages

- **Billing Integration**
  - Stripe service ready
  - Need billing page & webhook handler

- **Recovery History**
  - Database models ready
  - Need API routes & frontend page

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js + Express
- Prisma ORM + PostgreSQL
- JWT authentication
- Stripe payments
- Bcrypt password hashing

**Frontend:**
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- next-intl (i18n)
- Stripe.js

### Database Schema

- `User` - User accounts & authentication
- `Subscription` - Stripe subscriptions & plan details
- `Account` - Account vault (multi-account management)
- `Recovery` - Recovery attempts & history
- `AuditLog` - Security audit logs
- `Session` - JWT sessions
- `Plan` - Subscription plan definitions

## 🔐 Security Features

- Zero-knowledge recovery (no password storage)
- Cryptographically secure tokens (256-bit)
- Bcrypt hashing (cost factor 12)
- Single-use tokens with expiration
- Rate limiting on all endpoints
- CORS protection
- Security headers (CSP, HSTS, etc.)
- Input sanitization

## 📝 Environment Variables

See `backend/env.example` and `frontend/env.example` for required variables.

**Backend:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret (64+ chars)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

**Frontend:**
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

## 🎨 Design

- **Theme:** White fintech background
- **Branding:** Teal → Blue → Purple gradient
- **Style:** Trust-focused, identity-security look
- **Responsive:** Mobile-first design

## 📊 Pricing Plans

- **FREE** - 1-2 lifetime recoveries, email only
- **BASIC** - $19.99/month, 20 recoveries, vault (15 accounts)
- **PRO** - $39.99/month, unlimited, AI voice, audit logs
- **BUSINESS** - Custom pricing, team features, SSO, API

## 🌍 Supported Languages

- English
- Spanish
- French
- Portuguese
- German
- Italian
- Dutch
- Arabic
- Haitian Creole
- Chinese (Simplified)

## 📚 API Documentation

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/password/recovery/start` - Start password recovery
- `POST /api/auth/password/reset` - Reset password with token
- `GET /api/auth/me` - Get current user

### Recovery

- `POST /api/recovery/start` - Start recovery process
- `POST /api/recovery/verify` - Verify recovery session
- `POST /api/recovery/complete` - Complete recovery

See backend docs for detailed API documentation.

## 🔄 Development

```bash
# Backend
cd backend
npm run dev        # Start with nodemon
npm run prisma:studio  # Open Prisma Studio

# Frontend
cd frontend
npm run dev        # Start Next.js dev server
npm run build      # Build for production
```

## 📦 Deployment

See `DEPLOYMENT.md` for detailed deployment guides:
- Backend: Render/Railway
- Frontend: Vercel
- Database: PostgreSQL (managed)

## 🛠️ Next Steps

1. Add video assets for hero sections
2. Complete translations for all languages
3. Implement account vault API & pages
4. Build billing/subscription management
5. Add recovery history page
6. Connect frontend to backend APIs
7. Test end-to-end flows

## 📄 License

ISC

---

**Built with security, trust, and global accessibility in mind.**
