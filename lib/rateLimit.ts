import { NextRequest } from "next/server";

// Simple in-memory rate limiter
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum number of requests per window
}

export function rateLimit(config: RateLimitConfig) {
  return (request: NextRequest): { limited: boolean; remaining: number } => {
    const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown";
    const key = `${ip}`;
    const now = Date.now();

    if (!store[key] || store[key].resetTime < now) {
      // First request or window expired
      store[key] = {
        count: 1,
        resetTime: now + config.windowMs,
      };
      return { limited: false, remaining: config.maxRequests - 1 };
    }

    store[key].count++;

    if (store[key].count > config.maxRequests) {
      return { limited: true, remaining: 0 };
    }

    return { limited: false, remaining: config.maxRequests - store[key].count };
  };
}

// Pre-configured rate limiters
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 1000, // Limit each IP to 1000 requests per 15 minutes
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 200, // Limit each IP to 200 auth attempts per 15 minutes
});

export const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // Limit each IP to 100 requests per minute
});
