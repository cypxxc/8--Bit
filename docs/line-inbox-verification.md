# LINE inbox verification — 2026-09-07

- Supabase migration applied; receiver `line-webhook` deployed with HMAC authentication and required destination validation.
- LINE endpoint test returned `success: true`, statusCode 200. Use webhook and redelivery enabled for @356qitzh.
- Real user-sent text “ทดสอบแชทจากหลังบ้าน” received at 04:47:46 UTC, persisted and shown in the browser room with LINE profile name CHAYAPHON✿.
- Tests cover wrong signature, wrong destination, empty verification events, unavailable storage, group exclusion, no reply-token storage, duplicate deliveries, same-name/different-ID customers, unsend before and after message, anonymous and non-owner denial, private attachments, independent unread counters, late arrivals and pagination.
- TypeScript, focused ESLint and production build passed. Desktop and 390px mobile layout checked in browser, with no horizontal overflow. Switching rooms, returning to the list, loading eight older messages after the latest fifty, and returning to the latest page passed. Browser assets contain none of the Supabase secret, LINE token or channel secret. Temporary customers, messages and owner account were removed after testing.
- Supabase security advisor: new chat tables have RLS enabled with no direct client grants or policies intentionally (server-only access). Existing leaked-password-protection warning is unchanged; remediation links are in admin-guide.md.
- Text receiving is end-to-end verified. Real image/audio/video/file rendering has not been exercised with customer uploads. LINE may expire source media. The inbox currently reads incoming messages; replies remain in LINE OA Manager.
