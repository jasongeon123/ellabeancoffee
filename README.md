# Ella Bean Coffee ☕

A modern, clean coffee shop web application inspired by Blue Bottle Coffee. Features include product showcase, location bulletin board, user authentication, shopping cart, and a full admin dashboard.

## Features

### Customer Features
- 🎨 Clean, minimalist design inspired by Blue Bottle Coffee
- 📦 Product catalog with beautiful imagery
- 📍 Location bulletin board for upcoming events and mobile locations
- 🛒 Shopping cart with persistent sessions
- 👤 User authentication (sign up/sign in)
- 💾 Cart persistence - your cart is saved even after logging out

### Admin Features
- 📊 Dashboard with site analytics and metrics
- ✏️ Add/edit/delete products with full CRUD operations
- 🖼️ Image upload and gallery management (images saved permanently)
- 📍 Manage location bulletin board
- 📈 View site traffic and user activity
- 💰 Track orders and revenue

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (production) / SQLite (local development) via Prisma ORM
- **Authentication**: NextAuth.js
- **Password Hashing**: bcryptjs
- **Payments**: Stripe
- **Email**: Resend

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

The database is already initialized. To seed it with sample data and an admin account:

```bash
npm run db:seed
```

This will create:
- Admin account (email: `admin@ellabean.com`, password: `admin123`)
- 6 sample products using your images
- A sample location for the bulletin board

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Access Admin Panel

1. Sign in with the admin credentials:
   - Email: `admin@ellabean.com`
   - Password: `admin123`

2. Navigate to `/admin` or click "Admin" in the navbar

## Admin Dashboard

The admin dashboard includes:

- **Dashboard** (`/admin`) - Overview with stats and recent activity
- **Products** (`/admin/products`) - Add, edit, and delete products
- **Locations** (`/admin/locations`) - Manage bulletin board announcements
- **Analytics** (`/admin/analytics`) - Detailed site traffic and metrics

## Project Structure

```
ellabeancoffee/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── cart/              # Shopping cart
│   └── page.tsx           # Homepage
├── components/            # React components
├── lib/                   # Utilities and configurations
│   ├── auth.ts           # NextAuth configuration
│   └── prisma.ts         # Prisma client
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
├── public/               # Static assets (images)
└── pictures/             # Original images
```

## Environment Variables

The `.env` file is already configured with:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

**⚠️ Important**: Change `NEXTAUTH_SECRET` to a secure random string before deploying to production!

## Customization

### Adding Products

1. Go to `/admin/products`
2. Fill in the product details
3. For the image:
   - Click "Browse Images" to see your image gallery
   - Upload a new image (it will be saved permanently in the database)
   - Or manually enter a path like `/1.jpg`, `/2.jpg`, etc.
4. Click "Add Product"

### Editing Products

1. Go to `/admin/products`
2. Click "Edit" next to any product
3. Update any fields including the image
4. Click "Update Product"

The image gallery stores all uploaded images permanently, so you can reuse them across multiple products without worrying about losing them if you delete a product.

### Managing Locations

1. Go to `/admin/locations`
2. Add new locations with title, description, address, and date
3. Toggle visibility on the bulletin board
4. Delete old locations

### Changing Colors

Edit `tailwind.config.ts` to customize the coffee color palette:

```typescript
colors: {
  coffee: {
    50: '#faf7f4',   // Lightest
    900: '#5a3c2b',  // Darkest
  },
}
```

## Production Deployment

This project is ready to deploy to production! See the comprehensive deployment guide:

**📘 [DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete step-by-step guide for deploying to Vercel with Neon PostgreSQL

**Quick Summary:**
1. Push code to GitHub
2. Create Neon PostgreSQL database (free)
3. Deploy to Vercel (free)
4. Connect domain: ellabeancoffee.com
5. Total cost: $0/month

The deployment guide covers:
- Setting up GitHub repository
- Configuring Neon PostgreSQL
- Deploying to Vercel
- Connecting your domain
- Setting up Stripe payments
- Email configuration with Resend
- Post-deployment testing

**📘 [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md)** - Guide for continuing local development

## Support

For issues or questions, please check:
- Next.js documentation: https://nextjs.org/docs
- Prisma documentation: https://www.prisma.io/docs
- NextAuth.js documentation: https://next-auth.js.org

## License

MIT

---

Built with ☕ and Claude Code
