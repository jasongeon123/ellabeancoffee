# API Testing Guide

This guide explains how to test API routes in the Ella Bean Coffee application.

## Table of Contents
- [Testing Strategy](#testing-strategy)
- [Unit Tests](#unit-tests)
- [E2E API Tests](#e2e-api-tests)
- [Manual Testing](#manual-testing)
- [Test Data Setup](#test-data-setup)

---

## Testing Strategy

For Next.js API routes, we recommend a multi-layered testing approach:

1. **Unit Tests** - Test business logic in isolation (utilities, helpers)
2. **E2E Tests** - Test full API endpoints with a test database
3. **Manual Tests** - Use tools like Postman or REST Client for exploratory testing

---

## Unit Tests

We've already set up unit tests for utility functions like `guestCart.ts`. These tests:
- Run quickly (< 1s)
- Don't require database
- Test pure functions in isolation

### Running Unit Tests

```bash
npm test              # Watch mode
npm run test:run      # Run once
npm run test:coverage # With coverage
```

### Example Unit Test

```typescript
import { describe, it, expect } from 'vitest';
import { addToGuestCart, getGuestCart } from './guestCart';

describe('addToGuestCart', () => {
  it('should add item to cart', () => {
    addToGuestCart('product-123', 2);
    const cart = getGuestCart();

    expect(cart.items).toContainEqual({
      productId: 'product-123',
      quantity: 2,
    });
  });
});
```

---

## E2E API Tests

For testing API routes, we recommend End-to-End tests with a real test database.

### Setup Test Database

1. Create a separate test database:

```bash
# .env.test
DATABASE_URL="postgresql://user:pass@localhost:5432/ellabeancoffee_test"
NEXTAUTH_SECRET="test-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

2. Install Playwright for E2E testing:

```bash
npm install -D @playwright/test
```

3. Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Example E2E API Test

Create `tests/e2e/api/coupons.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Coupon API', () => {
  test('should validate valid coupon', async ({ request }) => {
    const response = await request.post('/api/coupons/validate', {
      data: {
        code: 'SAVE20',
        cartTotal: 100,
      },
    });

    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.valid).toBe(true);
    expect(json.discountAmount).toBeGreaterThan(0);
  });

  test('should reject invalid coupon', async ({ request }) => {
    const response = await request.post('/api/coupons/validate', {
      data: {
        code: 'INVALID',
        cartTotal: 100,
      },
    });

    expect(response.status()).toBe(404);
    const json = await response.json();
    expect(json.error).toBe('Invalid coupon code');
  });
});
```

### Running E2E Tests

```bash
npx playwright test                 # Run all E2E tests
npx playwright test --ui            # Run with UI
npx playwright test api/coupons    # Run specific test file
npx playwright show-report         # Show test report
```

---

## Manual Testing

### Using VS Code REST Client

Install the "REST Client" extension and create `tests/api/requests.http`:

```http
### Validate Coupon
POST http://localhost:3000/api/coupons/validate
Content-Type: application/json

{
  "code": "SAVE20",
  "cartTotal": 100
}

### Get User Points (requires auth)
GET http://localhost:3000/api/user/points
Cookie: next-auth.session-token=YOUR_SESSION_TOKEN

### Flag Review
POST http://localhost:3000/api/reviews/review-123/flag
Content-Type: application/json
Cookie: next-auth.session-token=YOUR_SESSION_TOKEN

{
  "reason": "Spam"
}

### Admin: Get Reviews
GET http://localhost:3000/api/admin/reviews?filter=flagged
Cookie: next-auth.session-token=YOUR_ADMIN_SESSION_TOKEN
```

### Using Postman

1. Import the Postman collection from `tests/api/ellabean.postman_collection.json`
2. Set environment variables:
   - `baseUrl`: http://localhost:3000
   - `sessionToken`: Your auth token
3. Run individual requests or the entire collection

---

## Test Data Setup

### Creating Test Data

Create a test seed script `prisma/seed.test.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      password: await bcrypt.hash('password123', 10),
      role: 'user',
      loyaltyPoints: 100,
    },
  });

  // Create test admin
  const testAdmin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Test Admin',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
    },
  });

  // Create test products
  await prisma.product.createMany({
    data: [
      {
        name: 'Test Coffee Blend',
        slug: 'test-coffee-blend',
        description: 'A test coffee blend',
        price: 19.99,
        image: '/images/test.jpg',
        category: 'coffee',
        inStock: true,
        stock: 100,
      },
      {
        name: 'Decaf Blend',
        slug: 'decaf-blend',
        description: 'Test decaf blend',
        price: 15.99,
        image: '/images/test2.jpg',
        category: 'coffee',
        inStock: true,
        stock: 50,
      },
    ],
  });

  // Create test coupon
  await prisma.coupon.create({
    data: {
      code: 'SAVE20',
      description: 'Save 20%',
      discountPercent: 20,
      active: true,
    },
  });

  console.log('Test data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run test seed:
```bash
npx tsx prisma/seed.test.ts
```

### Cleaning Test Data

Create `tests/helpers/cleanup.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function cleanupTestData() {
  await prisma.$transaction([
    prisma.review.deleteMany(),
    prisma.order.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.coupon.deleteMany(),
    prisma.product.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

// Run cleanup after tests
if (require.main === module) {
  cleanupTestData()
    .then(() => console.log('Test data cleaned'))
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
```

---

## API Endpoints to Test

### Public Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/coupons/validate` | POST | Validate coupon code |
| `/api/products/batch` | GET | Get products in batch |
| `/api/products/[id]/reviews` | GET | Get product reviews |
| `/api/track-order` | POST | Track order by number |
| `/api/contact` | POST | Submit contact form |

### Authenticated Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/user/points` | GET | Get user loyalty points | User |
| `/api/reviews` | POST | Submit review | User |
| `/api/reviews/[id]/flag` | POST | Flag review | User |
| `/api/reviews/[id]/vote` | POST | Vote on review | User |
| `/api/cart/[id]` | DELETE | Remove from cart | User |
| `/api/checkout` | POST | Create order | User |

### Admin Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/admin/reviews` | GET | Get all reviews | Admin |
| `/api/admin/reviews/[id]` | PATCH | Update review status | Admin |
| `/api/admin/products` | POST | Create product | Admin |
| `/api/admin/coupons` | POST | Create coupon | Admin |
| `/api/admin/orders/[id]/status` | PATCH | Update order status | Admin |

---

## Testing Best Practices

### 1. Test Isolation

Each test should be independent:

```typescript
test.beforeEach(async () => {
  // Clean up before each test
  await cleanupTestData();
  // Set up fresh test data
  await seedTestData();
});
```

### 2. Test Error Cases

Don't just test happy paths:

```typescript
test('should handle invalid input', async ({ request }) => {
  const response = await request.post('/api/coupons/validate', {
    data: { code: '' }, // Missing cartTotal
  });
  expect(response.status()).toBe(400);
});
```

### 3. Test Authentication

Test both authenticated and unauthenticated scenarios:

```typescript
test('should require authentication', async ({ request }) => {
  const response = await request.get('/api/user/points');
  expect(response.status()).toBe(401);
});

test('should work with valid session', async ({ request, context }) => {
  // Set auth cookie
  await context.addCookies([{
    name: 'next-auth.session-token',
    value: 'valid-token',
    domain: 'localhost',
    path: '/',
  }]);

  const response = await request.get('/api/user/points');
  expect(response.status()).toBe(200);
});
```

### 4. Test Edge Cases

```typescript
test('should handle extremely large cart total', async ({ request }) => {
  const response = await request.post('/api/coupons/validate', {
    data: {
      code: 'SAVE20',
      cartTotal: 999999,
    },
  });
  expect(response.ok()).toBe(true);
});

test('should prevent SQL injection', async ({ request }) => {
  const response = await request.post('/api/coupons/validate', {
    data: {
      code: "'; DROP TABLE users; --",
      cartTotal: 100,
    },
  });
  expect(response.status()).toBe(404); // Should not crash
});
```

---

## Continuous Integration

Add E2E tests to your CI pipeline in `.github/workflows/ci.yml`:

```yaml
e2e-tests:
  name: E2E Tests
  runs-on: ubuntu-latest

  services:
    postgres:
      image: postgres:15
      env:
        POSTGRES_USER: postgres
        POSTGRES_PASSWORD: postgres
        POSTGRES_DB: ellabeancoffee_test
      ports:
        - 5432:5432

  steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'

    - name: Install dependencies
      run: npm ci

    - name: Setup test database
      run: |
        npx prisma generate
        npx prisma db push
        npx tsx prisma/seed.test.ts
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ellabeancoffee_test

    - name: Install Playwright Browsers
      run: npx playwright install --with-deps

    - name: Run E2E tests
      run: npx playwright test
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ellabeancoffee_test
        NEXTAUTH_SECRET: test-secret
        NEXTAUTH_URL: http://localhost:3000

    - name: Upload test report
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: playwright-report
        path: playwright-report/
```

---

## Debugging Failed Tests

### 1. View Test Output

```bash
npx playwright test --debug        # Debug mode
npx playwright test --headed       # Show browser
npx playwright test --trace on     # Enable tracing
```

### 2. Inspect Network Requests

```typescript
test('debug coupon validation', async ({ request, page }) => {
  // Listen to all requests
  page.on('request', request => console.log('>>', request.method(), request.url()));
  page.on('response', response => console.log('<<', response.status(), response.url()));

  // Your test code
});
```

### 3. Check Database State

```typescript
test('verify database state', async ({ request }) => {
  // Your API call
  await request.post('/api/coupons/validate', { data: {...} });

  // Check database directly
  const coupon = await prisma.coupon.findUnique({ where: { code: 'SAVE20' } });
  console.log('Coupon state:', coupon);
});
```

---

## Resources

- [Playwright API Testing](https://playwright.dev/docs/api-testing)
- [Next.js API Routes Testing](https://nextjs.org/docs/app/building-your-application/testing)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
- [Vitest Documentation](https://vitest.dev/)
