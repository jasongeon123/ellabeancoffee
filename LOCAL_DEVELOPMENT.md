# Local Development Guide

## Quick Start

Your project is now configured for PostgreSQL in production, but you can continue using SQLite for local development.

### Option 1: Continue with SQLite (Easiest)

Keep your current `.env` file as-is:

```env
DATABASE_URL="file:./dev.db"
```

**Note**: Your Prisma schema now uses PostgreSQL syntax. While most features work with SQLite, you may encounter minor compatibility issues. If you do, switch to Option 2.

### Option 2: Use PostgreSQL Locally (Recommended)

This matches your production environment exactly.

#### Install PostgreSQL

**Windows:**
1. Download from https://www.postgresql.org/download/windows/
2. Run installer, set password for `postgres` user
3. Remember the password!

**Mac (with Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Create Local Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ellabeancoffee_dev;

# Exit
\q
```

#### Update .env

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ellabeancoffee_dev"
```

#### Push Schema to Database

```bash
npx prisma db push
npm run db:seed
```

---

## Development Workflow

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Access application
# http://localhost:3000
```

### Making Database Changes

```bash
# After modifying prisma/schema.prisma
npx prisma db push

# Regenerate Prisma Client
npx prisma generate

# Open Prisma Studio (visual database editor)
npx prisma studio
```

---

## Testing Before Deployment

Before pushing to production, test locally:

1. Build the production version:
   ```bash
   npm run build
   npm start
   ```

2. Test all features:
   - [ ] User registration/login
   - [ ] Adding to cart
   - [ ] Checkout process
   - [ ] Admin panel
   - [ ] Product reviews
   - [ ] Subscriptions

3. Check for build errors or warnings

---

## Environment Variables for Local Development

Your `.env` file should have:

```env
DATABASE_URL="file:./dev.db"  # or PostgreSQL URL
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Stripe Test Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# Resend API Key
RESEND_API_KEY="re_..."
```

**Never commit your `.env` file to Git!** It's already in `.gitignore`.

---

## Useful Commands

```bash
# Reset database (careful!)
npx prisma db push --force-reset

# Re-seed database
npm run db:seed

# View database in browser
npx prisma studio

# Format Prisma schema
npx prisma format

# Check for issues
npm run lint

# Build for production
npm run build
```

---

## Troubleshooting

### "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### Database out of sync with schema
```bash
npx prisma db push
```

### Port 3000 already in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Need to start fresh
```bash
# Delete database and start over
rm prisma/dev.db
npx prisma db push
npm run db:seed
```
