# Backend verification — 2026-09-07

Verified against the connected 8bit Supabase project and a separate local production server with LINE delivery disabled. Temporary customers, services, notifications, and the test owner are removed after browser checks.

- Four validation tests: privileged-field injection stripped, bounded and required input, UUID/idempotency validation, duplicate service IDs, valid statuses, version checking, nullable/zero/negative prices.
- All admin endpoints deny anonymous access; a signed-in non-owner cannot log in to the admin workspace.
- Supabase public key cannot read internal tables. Owner APIs require membership checked on the server.
- Owner login issues HttpOnly session cookies. Cross-origin mutations are denied, including with valid owner cookies.
- Store intake persists, repeated idempotency keys return the existing record, and stale job edits return 409.
- Website intake persists before notification; disabled LINE configuration creates a visible skipped record. A duplicate submission does not create a second job or notification.
- Notification retries preserve attempts; accepted messages are never resent; old uncertain results cannot be retried beyond the safe window.
- Service price/name/description and activation changes propagate to the public endpoint. Disabled services cannot be requested.
- One-time password setup works and rejects token replay.
- Browser checks: login, job details, editing internal notes, notification history, service editor, native dialog, mobile overflow checks.
- Production build and TypeScript checks pass. Focused lint passes for the backend and new admin components.

No real LINE test messages were sent during this backend verification. The existing LINE connection was verified with a real message earlier in the conversation.

The Supabase advisor reports intentional default-deny RLS tables without public policies and the pre-existing leaked-password-protection setting. See admin-guide.md for details and references.
