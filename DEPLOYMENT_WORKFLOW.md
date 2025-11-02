# Deployment Workflow - Production & Staging

This document explains how to work with production and staging environments for Ella Bean Coffee.

---

## Environment Overview

| Environment | Branch | URL | Database | Stripe Keys | Purpose |
|------------|--------|-----|----------|-------------|---------|
| **Production** | `main` | ellabeancoffee.com | Production DB (Neon) | **LIVE** keys | Real customers, real payments |
| **Staging** | `staging` | staging-ellabean.vercel.app | Staging DB (Neon) | **TEST** keys | Testing before production |

---

## Setup Instructions

### Step 1: Create Staging Database (One-time setup)

1. Go to https://neon.tech
2. Click **"Create Project"**
3. Name: `ellabeancoffee-staging`
4. Copy the connection string (save for later)

### Step 2: Configure Vercel Environment Variables

Vercel automatically deploys both `main` and `staging` branches, but you need to set environment-specific variables.

#### In Vercel Dashboard:

1. Go to your project → **Settings** → **Environment Variables**

2. For each variable, select which environment it applies to:
   - ☑ Production (main branch)
   - ☑ Preview (staging branch + PR previews)
   - ☐ Development (local only)

#### Production Environment Variables:
```
DATABASE_URL = postgresql://... (production Neon database)
NEXTAUTH_SECRET = (your production secret)
NEXTAUTH_URL = https://ellabeancoffee.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_... (LIVE Stripe key)
STRIPE_SECRET_KEY = sk_live_... (LIVE Stripe key)
RESEND_API_KEY = re_... (production Resend key)
```

#### Staging Environment Variables:
```
DATABASE_URL = postgresql://... (staging Neon database)
NEXTAUTH_SECRET = (can be same or different)
NEXTAUTH_URL = https://staging-ellabean.vercel.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_... (TEST Stripe key)
STRIPE_SECRET_KEY = sk_test_... (TEST Stripe key)
RESEND_API_KEY = re_... (can be same or separate test key)
```

**Important:** Make sure staging uses **TEST** Stripe keys, not LIVE!

### Step 3: Deploy Staging Branch

1. Vercel automatically deploys `staging` branch when you push to it
2. First deployment: Push schema to staging database
   ```bash
   # Temporarily update .env with staging DATABASE_URL
   npx prisma db push
   npm run db:seed
   # Don't commit this .env change!
   ```

### Step 4: Set Up Custom Domain for Staging (Optional)

1. In Vercel → Settings → Domains
2. Add: `staging.ellabeancoffee.com`
3. In Squarespace DNS:
   - Add CNAME record: `staging` → `cname.vercel-dns.com`
4. In Vercel, assign `staging.ellabeancoffee.com` to the **Preview** environment

---

## Development Workflow

### Daily Development (Testing New Features)

```bash
# 1. Start from main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/new-feature-name

# 3. Make your changes
# ... code, test locally ...

# 4. Commit and push
git add .
git commit -m "Add new feature description"
git push origin feature/new-feature-name

# 5. Create Pull Request to staging (not main!)
# Go to GitHub and create PR: feature/new-feature-name → staging
```

### Testing on Staging

```bash
# 1. Merge feature to staging
git checkout staging
git pull origin staging
git merge feature/new-feature-name
git push origin staging

# 2. Vercel auto-deploys to staging URL
# Wait 1-2 minutes for deployment

# 3. Test on staging site
# Visit: https://staging-ellabean.vercel.app
# Test with Stripe test cards: 4242 4242 4242 4242

# 4. If bugs found, fix them and push to staging again
```

### Deploying to Production

**Only deploy to production after testing on staging!**

```bash
# 1. Make sure staging works perfectly
# Test everything on staging first!

# 2. Merge staging into main
git checkout main
git pull origin main
git merge staging

# 3. Push to production
git push origin main

# 4. Vercel auto-deploys to ellabeancoffee.com
# Monitor deployment in Vercel dashboard

# 5. Test production site
# Visit: https://ellabeancoffee.com
# Verify everything works with LIVE Stripe keys
```

---

## Quick Reference Commands

### Switch Branches
```bash
# Work on staging
git checkout staging

# Work on production
git checkout main

# Create new feature
git checkout -b feature/feature-name
```

### Deploy Staging
```bash
git checkout staging
git add .
git commit -m "Your changes"
git push origin staging
# Vercel auto-deploys
```

### Deploy Production
```bash
# First test on staging, then:
git checkout main
git merge staging
git push origin main
# Vercel auto-deploys to ellabeancoffee.com
```

### Rollback Production (Emergency)
```bash
# In Vercel dashboard:
# 1. Go to Deployments
# 2. Find last working deployment
# 3. Click "..." menu → Promote to Production
```

---

## Environment-Specific Testing

### Testing Payments

**Staging (Test Mode):**
- Use Stripe test cards
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- No real money charged

**Production (Live Mode):**
- Real credit cards
- Real money charged
- Be careful!

### Testing Email

Both environments can use the same Resend account, or you can:
- Staging: Use test email addresses
- Production: Send to real customers

---

## Vercel Automatic Deployments

Vercel automatically deploys:

| Git Action | Vercel Deployment | URL |
|-----------|------------------|-----|
| Push to `main` | Production | ellabeancoffee.com |
| Push to `staging` | Preview (Staging) | staging-ellabean.vercel.app |
| Create Pull Request | Preview (Temporary) | pr-123-ellabean.vercel.app |

Every PR gets its own preview URL for testing!

---

## Best Practices

✅ **Always test on staging first**
✅ **Never push untested code to main**
✅ **Use test Stripe keys on staging**
✅ **Keep staging and main databases separate**
✅ **Test critical features (checkout, auth) on staging**
✅ **Review Vercel deployment logs for errors**

❌ **Don't use live Stripe keys on staging**
❌ **Don't skip testing on staging**
❌ **Don't push directly to main without review**
❌ **Don't share production database with staging**

---

## Troubleshooting

### Staging deployment failed
- Check Vercel logs
- Verify environment variables are set for Preview
- Check DATABASE_URL points to staging database

### Production works but staging doesn't
- Different environment variables
- Check which environment variables are enabled in Vercel

### Need to reset staging database
```bash
# Update .env with staging DATABASE_URL
npx prisma db push --force-reset
npm run db:seed
```

### Accidentally deployed bad code to production
1. Go to Vercel → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"
4. Fix the bug on staging first, then redeploy

---

## Summary

**Development Flow:**
```
Local Development → Feature Branch → Staging → Production
     ↓                   ↓              ↓          ↓
  localhost:3000    (PR preview)    staging    ellabeancoffee.com
```

**Never skip staging!** It's your safety net before production.
