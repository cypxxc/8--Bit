# Landing page release

The public site retains the existing 8-bit theme. CRT and audio effects start off. Service data is rendered on the server and refreshed in the browser; database outages leave a visible LINE contact path. The inquiry form uses the existing idempotent API, bounded fields and a 15-second timeout. LINE and service dialogs use native modal focus handling and Escape. QR is a local SVG, generated from the verified OA link.

## Required deployment configuration

- Set `SITE_URL` to the verified HTTPS production origin before building. Until set, the homepage has noindex and robots disallows crawling. With it set, canonical, social metadata and sitemap use that origin. Admin stays noindex and protected by authentication regardless of robots.
- Set public contact variables only to verified shop information. Without them the footer asks visitors to contact LINE for hours, directions and appointments. No sample phone, address or public email is published.
- Set the existing Supabase and LINE server environment variables on the hosting provider. Never prefix server secrets with NEXT_PUBLIC.
- Use HTTPS. The hosting proxy must overwrite forwarded IP headers for the existing request rate limiter. Confirm production Auth URLs and that owner login works on the public domain.

## Validation

Run `npm run build`, focused ESLint and the existing validation/webhook unit tests. Inspect the page at desktop and mobile widths, service/LINE modals, keyboard closure, contact links, and validation without creating a customer request. Verify robots, sitemap, generated sharing image and response headers on the final host. Perform one controlled real request on production and verify the saved record before announcing the website live.

This work prepares the landing page locally; it does not publish a new deployment. Shop contact details and the final domain remain awaiting the owner. The data-use text describes the implemented request handling; it is not a claim of legal compliance or a substitute for any required full policy.

## Results — 2026-09-07

Production build, TypeScript, focused ESLint and eight existing validation/webhook tests passed. Read-only production smoke checks passed for server-rendered services, one H1, removal of example contact details, CRT off, noindex without a domain, robots/sitemap, security headers, a 1200×630 sharing PNG and local QR asset. Invalid and cross-origin form requests returned 400 and 403 without creating service requests. Browser checks at 390px and desktop widths found no horizontal overflow; mobile navigation, native LINE/service dialogs, Escape, focus restoration and inline missing-service validation were exercised. Desktop menu visibility was corrected after visual inspection. No Lighthouse score or real public-host performance measurement is claimed; hosting and final-domain end-to-end submission remain release checks.
