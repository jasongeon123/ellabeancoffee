# Security Features

This application implements industry-standard security measures to protect against common web vulnerabilities and attacks.

## 🛡️ Implemented Security Features

### 1. Rate Limiting (DDoS Protection)
**Prevents server overload and brute force attacks**

- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **Admin/Cart endpoints**: 10 requests per minute per IP
- **General API**: 100 requests per 15 minutes per IP
- Returns 429 status code when limit exceeded
- Automatic cleanup of old rate limit entries

**Location**: `lib/rateLimit.ts`, `middleware.ts`

### 2. Security Headers
**Protects against various web vulnerabilities**

- **X-Frame-Options**: Prevents clickjacking attacks
- **X-XSS-Protection**: Enables browser XSS protection
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **Content-Security-Policy**: Prevents XSS and injection attacks
- **Strict-Transport-Security**: Forces HTTPS in production
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Disables unnecessary browser features

**Location**: `middleware.ts`

### 3. Authentication Security
**Strong password requirements and secure storage**

- Minimum 8 characters
- Must contain letters and numbers
- bcrypt hashing with cost factor of 12
- Email validation and sanitization
- Protection against timing attacks
- Session-based authentication with NextAuth.js

**Location**: `app/api/auth/signup/route.ts`, `lib/auth.ts`

### 4. Input Validation & Sanitization
**Prevents injection attacks and data corruption**

- Email format validation
- String length limits (1-255 characters)
- HTML sanitization to prevent XSS
- SQL injection pattern detection
- Number range validation
- Trim and lowercase normalization

**Location**: `lib/security.ts`, `app/api/auth/signup/route.ts`

### 5. SQL Injection Protection
**Prisma ORM provides built-in protection**

- Parameterized queries
- Type-safe database operations
- No raw SQL execution
- Additional pattern detection layer

**Location**: All database operations use Prisma

### 6. File Upload Security
**Safe file handling**

- File size limits (configurable)
- MIME type validation
- Allowed file types whitelist
- Secure file storage

**Location**: `lib/security.ts`, `app/api/admin/upload/route.ts`

### 7. Session Security
**Secure session management**

- HTTP-only cookies (not accessible to JavaScript)
- Secure cookies in production (HTTPS only)
- Session expiration
- CSRF protection via NextAuth

**Location**: `lib/auth.ts`

### 8. Environment Variable Validation
**Ensures critical configuration is set**

- Validates required environment variables on startup
- Checks NEXTAUTH_SECRET strength
- Prevents deployment with missing config

**Location**: `lib/security.ts`

### 9. Error Handling
**Prevents information leakage**

- Generic error messages to users
- Detailed errors only logged server-side
- No stack traces exposed in production
- Silent failures for analytics

**Location**: Throughout all API routes

### 10. IP Tracking & Monitoring
**Security monitoring and analytics**

- Tracks IP addresses of all visitors
- User agent logging
- Timestamp tracking
- Admin dashboard for monitoring

**Location**: `middleware.ts`, `app/admin/page.tsx`

## 🔒 Best Practices

### For Deployment

1. **Environment Variables**
   ```bash
   # Generate a strong secret (min 32 characters)
   NEXTAUTH_SECRET=your-super-secret-key-here-min-32-chars

   # Set production URL
   NEXTAUTH_URL=https://yourdomain.com
   ```

2. **HTTPS Required**
   - Always use HTTPS in production
   - Strict-Transport-Security header enforces this

3. **Database Security**
   - Use strong database passwords
   - Restrict database access to application server only
   - Enable SSL for database connections in production

4. **Regular Updates**
   ```bash
   npm audit
   npm update
   ```

### For Development

1. **Never commit secrets**
   - Use `.env.local` for local development
   - Add to `.gitignore`

2. **Test rate limiting**
   - Ensure limits don't affect normal usage
   - Adjust if needed for your traffic patterns

3. **Monitor logs**
   - Check for suspicious activity
   - Review rate limit triggers
   - Track authentication failures

## 🚨 Security Checklist

Before deploying to production:

- [ ] Strong NEXTAUTH_SECRET set (32+ characters)
- [ ] HTTPS configured
- [ ] Database password is strong
- [ ] Environment variables are set
- [ ] Rate limits are appropriate
- [ ] File upload limits are set
- [ ] Regular backups configured
- [ ] npm audit shows no vulnerabilities
- [ ] Error logging is configured
- [ ] Admin accounts use strong passwords

## 📊 Monitoring

### Check for attacks in Admin Dashboard

Visit `/admin` to see:
- Recent visitor IPs
- Page access patterns
- Unusual activity

### Rate Limit Responses

When rate limited, users see:
```
429 Too Many Requests - Please slow down
Retry-After: 900
```

## 🆘 Reporting Security Issues

If you discover a security vulnerability:

1. **Do not** open a public issue
2. Contact the site administrator privately
3. Provide details of the vulnerability
4. Allow time for a fix before disclosure

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [bcrypt Best Practices](https://github.com/kelektiv/node.bcrypt.js#security-issues-and-concerns)
- [CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
