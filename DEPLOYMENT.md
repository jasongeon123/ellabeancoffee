# Deployment Guide for Ella Bean Coffee

This guide will walk you through deploying your Next.js coffee shop website to production using Vercel and Neon PostgreSQL.

## Prerequisites

- GitHub account
- Domain: ellabeancoffee.com (already owned)
- Stripe account (for payments)
- Resend account (for emails)

---

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `ellabeancoffee` (or your preferred name)
3. Don't initialize with README (you already have one)
4. Push your local code:

```bash
git init
git add .
git commit -m "Initial commit - Ella Bean Coffee website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ellabeancoffee.git
git push -u origin main
```

---

## Step 2: Set Up Neon PostgreSQL Database

1. Go to [Neon](https://neon.tech) and sign up for free
2. Click "Create Project"
3. Name it: `ellabeancoffee`
4. Select region closest to your users
5. Copy the connection string (looks like: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb`)
6. Save this connection string - you'll need it for Vercel

---

## Step 3: Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign up with GitHub
2. Click "Add New Project"
3. Import your `ellabeancoffee` repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: .next (auto-filled)

5. **Add Environment Variables** (click "Environment Variables"):

   ```
   DATABASE_URL=postgresql://user:password@host/database (from Neon)
   NEXTAUTH_SECRET=(generate with: openssl rand -base64 32)
   NEXTAUTH_URL=https://ellabeancoffee.com
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (from Stripe)
   STRIPE_SECRET_KEY=sk_live_... (from Stripe)
   RESEND_API_KEY=re_... (from Resend)
   ```

   **IMPORTANT**: Use your LIVE Stripe keys for production, not test keys!

6. Click "Deploy"
7. Wait for deployment to complete (2-3 minutes)

---

## Step 4: Run Database Migrations

After first deployment:

1. In Vercel dashboard, go to your project
2. Click on "Settings" → "Environment Variables"
3. Confirm `DATABASE_URL` is set correctly
4. Go to "Deployments" tab
5. Click on the latest deployment
6. You have two options:

   **Option A: Use Vercel CLI (recommended)**
   ```bash
   npm i -g vercel
   vercel login
   vercel env pull .env.production
   DATABASE_URL="your-neon-url" npx prisma db push
   ```

   **Option B: Use Neon SQL Editor**
   - Copy the SQL from `prisma/schema.prisma`
   - Run `npx prisma migrate dev --name init` locally first
   - Copy generated SQL to Neon's SQL editor

---

## Step 5: Connect Your Domain (ellabeancoffee.com)

1. In Vercel project, go to "Settings" → "Domains"
2. Add domain: `ellabeancoffee.com`
3. Add domain: `www.ellabeancoffee.com`
4. Vercel will show you DNS records to add

5. Go to your domain registrar (where you bought ellabeancoffee.com):
   - Add an **A record** pointing to Vercel's IP: `76.76.21.21`
   - Add a **CNAME record** for `www` pointing to `cname.vercel-dns.com`

   OR use Vercel nameservers (easier):
   - Change nameservers to Vercel's nameservers (shown in Vercel dashboard)

6. Wait for DNS propagation (can take 24-48 hours, usually faster)
7. Vercel will automatically provision SSL certificate

---

## Step 6: Set Up Production Services

### Stripe (Payment Processing)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Switch to "Live Mode" (toggle in top right)
3. Get your live API keys:
   - Publishable key: `pk_live_...`
   - Secret key: `sk_live_...`
4. Update these in Vercel environment variables
5. Set up webhook endpoint:
   - URL: `https://ellabeancoffee.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.created`, etc.

### Resend (Email Service)
1. Go to [Resend](https://resend.com)
2. Verify your domain `ellabeancoffee.com`:
   - Add DNS records for email authentication
   - This allows emails to come from `noreply@ellabeancoffee.com`
3. Create API key for production
4. Update `RESEND_API_KEY` in Vercel

### NextAuth
1. Generate a secure secret:
   ```bash
   openssl rand -base64 32
   ```
2. Update `NEXTAUTH_SECRET` in Vercel environment variables
3. Make sure `NEXTAUTH_URL` is set to `https://ellabeancoffee.com`

---

## Step 7: Seed Your Production Database

1. Create an admin account via Vercel CLI:
   ```bash
   vercel env pull .env.production
   npm run db:seed
   ```

   Or create admin manually through your app's signup page, then update role in database

2. Add your products through the admin panel at:
   `https://ellabeancoffee.com/admin`

---

## Step 8: Post-Deployment Checklist

- [ ] Website loads at https://ellabeancoffee.com
- [ ] SSL certificate is active (padlock in browser)
- [ ] Test user signup/login
- [ ] Test adding items to cart
- [ ] Test checkout with Stripe (use test card: 4242 4242 4242 4242)
- [ ] Test subscription flow
- [ ] Test admin panel access
- [ ] Verify emails are being sent
- [ ] Check analytics tracking
- [ ] Test on mobile devices

---

## Continuous Deployment

Once set up, Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Your changes"
git push
```

Vercel will build and deploy automatically. You can monitor deployments in the Vercel dashboard.

---

## Troubleshooting

### Build Fails
- Check Vercel build logs for errors
- Make sure all dependencies are in `package.json`
- Ensure environment variables are set

### Database Connection Issues
- Verify `DATABASE_URL` is correct in Vercel
- Check Neon database is active
- Ensure IP allowlist in Neon allows Vercel (usually automatic)

### Domain Not Working
- Wait 24-48 hours for DNS propagation
- Verify DNS records in your domain registrar
- Check Vercel domain settings

### Stripe Payments Failing
- Make sure you're using LIVE keys in production
- Check webhook is configured correctly
- Review Stripe dashboard logs

---

## Environment Variables Reference

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `DATABASE_URL` | PostgreSQL connection string | Neon dashboard |
| `NEXTAUTH_SECRET` | Authentication secret | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your production URL | `https://ellabeancoffee.com` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key | Stripe dashboard (Live mode) |
| `STRIPE_SECRET_KEY` | Stripe secret key | Stripe dashboard (Live mode) |
| `RESEND_API_KEY` | Email service API key | Resend dashboard |

---

## Cost Breakdown

- **Vercel**: Free (Hobby plan)
- **Neon**: Free (0.5GB storage, enough for small business)
- **Domain**: Already owned
- **Stripe**: 2.9% + $0.30 per transaction
- **Resend**: Free tier (100 emails/day)

**Total monthly cost**: $0 (plus transaction fees)

---

## Support

If you encounter issues:
- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs

---

**Ready to go live?** Start with Step 1 and work through each section. The entire process takes about 30-60 minutes.
