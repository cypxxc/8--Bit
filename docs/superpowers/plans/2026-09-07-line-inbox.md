# LINE inbox

Requested: show LINE OA messages inside the existing owner backend, clearly separated by customer.

Use a two-column inbox, customer search, unread badges, chronological messages and older-message pagination. Stable LINE user IDs identify rooms even when display names match. Refresh every 5 seconds while visible; owner-only APIs keep customer data private. Initially receive one-to-one conversations; group events are ignored explicitly.

Receive signed webhooks through a portable handler deployed as a Supabase Edge Function, so receiving continues when the shop computer is off. Persist each event atomically, deduplicate webhook event IDs, order by LINE timestamps and clear content on unsend, including redelivery after unsend. Profile lookups are optional enrichment. Attachments are fetched through an owner-only server endpoint and are not stored publicly.

Implementation: migration + atomic ingestion; signature handler + tests; protected inbox/read/media APIs; responsive inbox UI; deploy receiver, configure secret and LINE webhook; verify with fixtures and real incoming message once connected. Reply capability is pending the user's preference. Never send customer messages as a test.

Connection depends on access to LINE Developers and its channel secret. Existing LINE chat history is not imported, and LINE OA Manager outbound messages are not mirrored by this implementation.
