import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiLimiter, authLimiter, strictLimiter } from "./lib/rateLimit";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const isDevelopment = process.env.NODE_ENV === "development";

  // Skip rate limiting in development mode
  if (!isDevelopment) {
    // Apply rate limiting
    let rateLimitResult;

    // Stricter rate limiting for auth endpoints
    if (request.nextUrl.pathname.startsWith("/api/auth")) {
      rateLimitResult = authLimiter(request);
    }
    // Strict rate limiting for admin endpoints only
    else if (request.nextUrl.pathname.startsWith("/api/admin")) {
      rateLimitResult = strictLimiter(request);
    }
    // Standard rate limiting for other API routes (including cart)
    else if (request.nextUrl.pathname.startsWith("/api")) {
      rateLimitResult = apiLimiter(request);
    }

    // Block if rate limited
    if (rateLimitResult?.limited) {
      return new NextResponse("Too Many Requests - Please slow down", {
        status: 429,
        headers: {
          "Content-Type": "text/plain",
          "Retry-After": "900", // 15 minutes in seconds
        },
      });
    }
  }

  // Add comprehensive security headers
  const headers = response.headers;

  // Prevent clickjacking attacks
  headers.set("X-Frame-Options", "DENY");

  // Enable XSS protection
  headers.set("X-XSS-Protection", "1; mode=block");

  // Prevent MIME type sniffing
  headers.set("X-Content-Type-Options", "nosniff");

  // Referrer policy
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy - prevents XSS and injection attacks
  headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://api.stripe.com https://www.google-analytics.com https://www.facebook.com; frame-src https://js.stripe.com; frame-ancestors 'none';"
  );

  // Permissions policy - disable unnecessary browser features
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  // Strict Transport Security - force HTTPS
  if (process.env.NODE_ENV === "production") {
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  // Add caching headers for better performance
  const pathname = request.nextUrl.pathname;

  // Cache static assets aggressively
  if (pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|woff|woff2)$/)) {
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
  }
  // Cache API responses for short duration (except auth and cart)
  else if (pathname.startsWith("/api/products") && request.method === "GET") {
    headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
  }
  // No cache for dynamic API routes
  else if (pathname.startsWith("/api/cart") || pathname.startsWith("/api/auth") || pathname.startsWith("/api/user")) {
    headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
  }

  // Track page views for analytics (except for API routes, static files, and admin pages)
  // Skip analytics in development mode for better performance
  if (
    !isDevelopment &&
    !request.nextUrl.pathname.startsWith("/api") &&
    !request.nextUrl.pathname.startsWith("/_next") &&
    !request.nextUrl.pathname.includes(".")
  ) {
    try {
      // Use absolute URL for the fetch request
      const baseUrl = request.nextUrl.origin;
      await fetch(`${baseUrl}/api/analytics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: request.nextUrl.pathname,
          userAgent: request.headers.get("user-agent"),
          ip: request.ip || request.headers.get("x-forwarded-for"),
        }),
      });
    } catch (error) {
      // Silently fail - don't block the request if analytics fails
      console.error("Analytics tracking error:", error);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
