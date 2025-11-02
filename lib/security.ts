// Security utility functions

/**
 * Validates environment variables are properly set
 */
export function validateEnvironment() {
  const required = [
    "DATABASE_URL",
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  // Validate NEXTAUTH_SECRET is strong enough
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    console.warn(
      "⚠️  NEXTAUTH_SECRET should be at least 32 characters for production use"
    );
  }
}

/**
 * Sanitizes HTML to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validates and sanitizes file uploads
 */
export function validateFileUpload(file: File, options: {
  maxSizeMB: number;
  allowedTypes: string[];
}): { valid: boolean; error?: string } {
  // Check file size
  const maxBytes = options.maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File size must be less than ${options.maxSizeMB}MB`,
    };
  }

  // Check file type
  if (!options.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type must be one of: ${options.allowedTypes.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Generates a random token for CSRF protection
 */
export function generateToken(length: number = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Checks if a string contains potential SQL injection patterns
 * Note: Prisma already protects against SQL injection, but this is an extra layer
 */
export function containsSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/i,
    /(--|;|\/\*|\*\/|xp_|sp_)/i,
    /('|")\s*(OR|AND)\s*('|")\s*=\s*('|")/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Validates that a number is within a safe range
 */
export function validateNumber(
  value: any,
  min: number,
  max: number
): { valid: boolean; value?: number; error?: string } {
  const num = Number(value);

  if (isNaN(num)) {
    return { valid: false, error: "Must be a valid number" };
  }

  if (num < min || num > max) {
    return { valid: false, error: `Must be between ${min} and ${max}` };
  }

  return { valid: true, value: num };
}

/**
 * Rate limit check helper (returns retry-after header value)
 */
export function getRetryAfter(resetTime: number): number {
  return Math.ceil((resetTime - Date.now()) / 1000);
}
