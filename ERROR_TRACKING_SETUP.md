# Error Tracking Setup Guide

This guide explains how to set up error tracking and monitoring for the Ella Bean Coffee application.

## Table of Contents
- [Sentry Setup (Recommended)](#sentry-setup-recommended)
- [Alternative: LogRocket](#alternative-logrocket)
- [Custom Error Logging](#custom-error-logging)
- [Monitoring Checklist](#monitoring-checklist)

---

## Sentry Setup (Recommended)

Sentry provides comprehensive error tracking, performance monitoring, and user session replay.

### 1. Create Sentry Account

1. Visit [sentry.io](https://sentry.io)
2. Sign up for free account
3. Create new project for Next.js

### 2. Install Sentry

```bash
npm install @sentry/nextjs
```

### 3. Initialize Sentry

```bash
npx @sentry/wizard@latest -i nextjs
```

This wizard will:
- Create `sentry.client.config.ts`
- Create `sentry.server.config.ts`
- Create `sentry.edge.config.ts`
- Update `next.config.js`
- Add `.env.sentry-build-plugin` file

### 4. Configure Environment Variables

Add to `.env`:

```bash
SENTRY_DSN="https://YOUR_KEY@sentry.io/YOUR_PROJECT_ID"
NEXT_PUBLIC_SENTRY_DSN="https://YOUR_KEY@sentry.io/YOUR_PROJECT_ID"
```

### 5. Basic Configuration

#### `sentry.client.config.ts`

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production
  tracesSampleRate: 1.0,

  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  environment: process.env.NODE_ENV,

  beforeSend(event, hint) {
    // Filter out sensitive information
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
    }
    return event;
  },
});
```

#### `sentry.server.config.ts`

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,

  beforeSend(event) {
    // Remove sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
    }
    return event;
  },
});
```

### 6. Add Error Boundary

Create `components/ErrorBoundary.tsx`:

```typescript
"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-coffee-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Something went wrong!
        </h2>
        <p className="text-coffee-700 mb-6">
          We've been notified and will fix this as soon as possible.
        </p>
        <button
          onClick={() => reset()}
          className="w-full bg-coffee-900 text-white py-3 rounded-lg hover:bg-coffee-800 transition"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
```

Add `error.tsx` to catch errors:

```typescript
"use client";

import ErrorBoundary from "@/components/ErrorBoundary";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorBoundary error={error} reset={reset} />;
}
```

### 7. Track Custom Events

```typescript
import * as Sentry from "@sentry/nextjs";

// Track successful order
Sentry.addBreadcrumb({
  category: "order",
  message: "Order completed",
  level: "info",
  data: {
    orderId: order.id,
    total: order.total,
  },
});

// Track errors
try {
  await processPayment();
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: "checkout",
    },
    extra: {
      orderId: order.id,
    },
  });
}
```

### 8. Performance Monitoring

```typescript
import * as Sentry from "@sentry/nextjs";

// Trace slow operations
const transaction = Sentry.startTransaction({
  op: "task",
  name: "processOrder",
});

try {
  await processOrder(orderId);
} finally {
  transaction.finish();
}
```

---

## Alternative: LogRocket

LogRocket provides session replay and error tracking with focus on user experience.

### 1. Install LogRocket

```bash
npm install logrocket
npm install logrocket-react
```

### 2. Initialize LogRocket

Create `lib/logrocket.ts`:

```typescript
import LogRocket from 'logrocket';
import setupLogRocketReact from 'logrocket-react';

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  LogRocket.init('YOUR_APP_ID/your-app-name');
  setupLogRocketReact(LogRocket);
}

export default LogRocket;
```

### 3. Add to Root Layout

```typescript
import { useEffect } from 'react';
import LogRocket from '@/lib/logrocket';

export default function RootLayout({ children }) {
  useEffect(() => {
    if (user) {
      LogRocket.identify(user.id, {
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  return <html>{children}</html>;
}
```

### 4. Capture Custom Events

```typescript
import LogRocket from '@/lib/logrocket';

// Track custom events
LogRocket.track('OrderCompleted', {
  orderId: order.id,
  total: order.total,
});

// Track errors
try {
  await dangerousOperation();
} catch (error) {
  LogRocket.captureException(error);
}
```

---

## Custom Error Logging

For lightweight error tracking without third-party services:

### 1. Create Error Logger

Create `lib/errorLogger.ts`:

```typescript
interface ErrorLog {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, any>;
}

export async function logError(error: Error, metadata?: Record<string, any>) {
  const errorLog: ErrorLog = {
    message: error.message,
    stack: error.stack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date(),
    metadata,
  };

  // Send to your logging endpoint
  try {
    await fetch('/api/logs/error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorLog),
    });
  } catch (logError) {
    // Fallback: log to console
    console.error('Failed to log error:', error);
  }
}
```

### 2. Create Logging API Route

Create `app/api/logs/error/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const errorLog = await request.json();

    // Save to database
    await prisma.errorLog.create({
      data: {
        message: errorLog.message,
        stack: errorLog.stack,
        url: errorLog.url,
        userAgent: errorLog.userAgent,
        metadata: errorLog.metadata,
      },
    });

    // Optional: Send alert for critical errors
    if (errorLog.message.includes('Payment') || errorLog.message.includes('Database')) {
      await sendCriticalErrorAlert(errorLog);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging failed:', error);
    return NextResponse.json({ error: 'Logging failed' }, { status: 500 });
  }
}
```

### 3. Add Error Log Model to Prisma

```prisma
model ErrorLog {
  id        String   @id @default(cuid())
  message   String
  stack     String?  @db.Text
  url       String
  userAgent String
  metadata  Json?
  createdAt DateTime @default(now())

  @@index([createdAt])
}
```

---

## Monitoring Checklist

### Essential Monitoring

- [ ] Error tracking configured (Sentry/LogRocket)
- [ ] Performance monitoring enabled
- [ ] Database query monitoring
- [ ] API endpoint monitoring
- [ ] Payment processing errors tracked

### Error Alerts

Set up alerts for:
- Payment failures
- Database connection errors
- Authentication failures
- High error rates (>5% of requests)
- Slow API responses (>2s)

### Dashboard Metrics

Monitor these key metrics:
- Error rate by endpoint
- Response times (p50, p95, p99)
- Database query performance
- User session errors
- Checkout abandonment rate

### Regular Reviews

- Daily: Check critical error alerts
- Weekly: Review error trends
- Monthly: Analyze performance metrics
- Quarterly: Update alerting thresholds

---

## Best Practices

### 1. Filter Sensitive Data

```typescript
Sentry.init({
  beforeSend(event) {
    // Remove passwords, tokens, etc.
    if (event.request?.data) {
      delete event.request.data.password;
      delete event.request.data.creditCard;
      delete event.request.data.token;
    }
    return event;
  },
});
```

### 2. Add Context

```typescript
Sentry.setContext("order", {
  id: order.id,
  status: order.status,
  total: order.total,
});
```

### 3. Set User Context

```typescript
Sentry.setUser({
  id: user.id,
  email: user.email,
  role: user.role,
});
```

### 4. Tag Errors

```typescript
Sentry.setTag("payment_provider", "stripe");
Sentry.setTag("feature", "checkout");
```

### 5. Sample Rate in Production

```typescript
// Don't track every single error
Sentry.init({
  tracesSampleRate: 0.1, // 10% of transactions
  replaysSessionSampleRate: 0.01, // 1% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of error sessions
});
```

---

## Testing Error Tracking

### 1. Test Error Capture

Create a test page `app/test-error/page.tsx`:

```typescript
"use client";

export default function TestErrorPage() {
  return (
    <div className="p-8">
      <button
        onClick={() => {
          throw new Error("Test error from client");
        }}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        Trigger Client Error
      </button>
    </div>
  );
}
```

### 2. Test Server Error

Create `app/api/test-error/route.ts`:

```typescript
export async function GET() {
  throw new Error("Test error from server");
}
```

### 3. Verify in Sentry

1. Trigger test errors
2. Check Sentry dashboard
3. Verify errors appear with correct context
4. Test session replay (if enabled)

---

## Troubleshooting

### Errors Not Appearing in Sentry

- Check DSN is correct in `.env`
- Verify `NEXT_PUBLIC_SENTRY_DSN` is set
- Check network tab for failed uploads
- Ensure `sentry.*.config.ts` files are loaded

### Too Many Errors

- Increase sample rates
- Add filters in `beforeSend`
- Ignore known/expected errors
- Check for error loops

### Missing Context

- Add `Sentry.setContext()` calls
- Include breadcrumbs
- Set user information
- Add custom tags

---

## Cost Optimization

### Free Tier Limits

- **Sentry**: 5,000 errors/month, 10,000 performance units/month
- **LogRocket**: 1,000 sessions/month

### Optimization Tips

1. Sample non-critical errors
2. Filter out noisy errors
3. Reduce session replay rate
4. Use error grouping effectively
5. Archive resolved issues

---

## Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [LogRocket Documentation](https://docs.logrocket.com/)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Sentry Best Practices](https://docs.sentry.io/product/best-practices/)
