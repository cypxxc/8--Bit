# Security review — 2026-09-07

## Changes in this review

- Added per-response CSP nonces for `/` and `/admin/*`. Production scripts require the generated nonce or trusted script loading; no `unsafe-inline` or `unsafe-eval` for scripts. Inline CSS remains allowed for the existing Motion components. Frames, plugins, foreign form submissions and changes to the document base URL are blocked. LINE profile images are limited to LINE's image hosts.
- Root layout renders per request so scripts and the response nonce match. Pages using nonces must not be cached as shared HTML.
- Removed unconditional trust in `X-Forwarded-For`. With no verified proxy configuration, requests share an `unverified` rate-limit bucket. A configured IP header must contain one valid IP; equivalent IPv6 spellings are normalized.
- Added a normalized email/account login limit of 10 attempts per 15 minutes, in addition to the existing IP limit of 15. Rate-limit keys are hashed in the database. This reduces automated guessing; it does not replace MFA or perimeter protection.
- Mutations use the configured `SITE_URL` origin when available and reject cross-site browser requests. Without a configured domain, the same-host local development behavior remains supported.
- JSON body parsing now accepts the exact JSON media type with optional parameters, rather than any type containing the string `application/json`. The existing 20 KB limit remains.

## Verified

- Production build, TypeScript and focused ESLint passed.
- 11 unit tests passed, including untrusted IP spoofing, IPv6 normalization, trusted origin checks, input validation and LINE HMAC checks.
- `node tests/security-http.mjs` passed 23 checks against a local production server on port 3005: anonymous admin reads and mutations rejected; foreign-origin submissions rejected; oversized bodies rejected; forged webhook rejected; fresh CSP nonces match every rendered script; no-store and frame protection present.
- Headless Microsoft Edge loaded the home and login pages without runtime/CSP errors. The login submit button hydrated. A script deliberately inserted into the returned HTML without a nonce was blocked by CSP. The probe ran only in the local test browser and did not modify application files or send customer messages.
- `npm audit --omit=dev` reported zero known production dependency vulnerabilities at review time.
- Live Supabase catalog inspection: all 10 public tables have RLS enabled and no direct `anon`/`authenticated` read or write grants. All four `shop_*` functions deny execution to those roles. The existing server-only access model is intentional.
- No new customer records or LINE notifications were created by these checks. The owner's password was not changed. Authenticated owner workflows were not re-tested in a logged-in browser during this review.

## Deployment requirements and remaining limits

1. Set `SITE_URL` to the actual HTTPS website origin. Configure HTTPS redirects and HSTS at the hosting layer after the domain is verified. Do not cache HTML carrying a nonce or any admin/API response.
2. Set `TRUSTED_CLIENT_IP_HEADER` only after confirming the hosting proxy **overwrites** that header and direct access to Next.js is blocked. Do not copy an unverified browser-supplied header. Until then, the shared fallback means the existing intake limit of 30 requests/hour applies across all visitors; login and setup also use shared fallback buckets. This is intentionally conservative and needs deployment configuration before public traffic.
3. Configure hosting WAF/rate limits for volumetric attacks. Application counters still require a server/database request and are not DDoS protection. Distributed guessing can also temporarily exhaust an account's login quota.
4. Supabase's advisor still reports disabled leaked-password protection. This feature requires Pro or above; no plan upgrade or billing change was made. See [Supabase password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). Its RLS-without-policy notices are informational and expected for server-only tables: [advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
5. Admin MFA enrollment and enforcement, immediate verification of revoked session IDs, and backup/restore verification remain future work. `getUser()` and owner membership are checked on every protected API, but no stronger immediate session-revocation guarantee is claimed.
6. Resolved in the subsequent landing restoration: the form now sends active `serviceIds` and a stable retry `idempotencyKey`, uses the server-returned ticket reference, and never displays success on HTTP/network failure. Production-browser tests cover failure, retry and success with the ticket API mocked; no real notifications were sent.

This is a targeted application review, not a penetration test or a guarantee against compromise. No website deployment was performed in this review.
