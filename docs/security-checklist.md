# Security Checklist — Artisan Marketplace

## Authentication & Sessions
- [x] Passwords hashed with bcrypt (cost factor 12)
- [x] JWT stored in HttpOnly, Secure, SameSite=Lax cookies
- [x] Session expiry: 24 hours
- [x] CSRF protection via NextAuth.js built-in token validation
- [x] Email verification required before sign-in
- [x] Password reset tokens: single-use, 1-hour expiry
- [x] Password policy: 8+ chars, uppercase, lowercase, number, special char

## Input Validation
- [x] Zod schemas validate ALL API inputs server-side
- [x] Client-side validation for UX (not trusted for security)
- [x] SQL injection prevented: Prisma uses parameterized queries exclusively
- [x] XSS prevented: React auto-escapes output; CSP header restricts inline scripts

## File Uploads
- [x] MIME type validation (allowlist: JPEG, PNG, WebP, AVIF)
- [x] Magic bytes verification to prevent MIME spoofing
- [x] File size limit: 5MB (configurable)
- [x] Filename sanitization: path traversal chars stripped, random suffix added
- [x] Upload directory outside application code

## Rate Limiting
- [x] Auth endpoints: 5 requests per 15 minutes per IP
- [x] Booking creation: 10 per minute per user
- [x] Message sending: 30 per minute per user
- [x] File upload: 5 per 5 minutes per user
- [x] General API: 100 per 15 minutes per IP

## HTTP Security Headers
- [x] `Strict-Transport-Security` (HSTS): 2 years, includeSubDomains, preload
- [x] `Content-Security-Policy`: restrictive default-src, script-src, style-src
- [x] `X-Frame-Options`: SAMEORIGIN
- [x] `X-Content-Type-Options`: nosniff
- [x] `X-XSS-Protection`: 1; mode=block
- [x] `Referrer-Policy`: origin-when-cross-origin
- [x] `Permissions-Policy`: camera=(), microphone=(), geolocation=(self)

## Authorization
- [x] Role-based access control (CUSTOMER, ARTISAN, ADMIN)
- [x] Next.js middleware enforces route-level access
- [x] API routes verify session and role before processing
- [x] Booking status changes validated against user ownership + role

## Data Privacy
- [x] Minimal data collection (name, email, phone optional)
- [x] Passwords never stored in plaintext or logs
- [x] Reset/verification tokens not logged
- [ ] Data retention policy (recommended: 2 years for bookings, delete on account deletion)
- [ ] GDPR-compliant data export/deletion endpoint (recommended for EU users)

## Production Recommendations
- [ ] Use environment-specific secrets (never commit .env)
- [ ] Enable HTTPS everywhere (handle at load balancer/reverse proxy)
- [ ] Set up structured logging with log rotation
- [ ] Monitor for unusual auth failure patterns
- [ ] Enable Dependabot/Snyk for dependency vulnerability scanning
- [ ] Regular security audits and penetration testing
