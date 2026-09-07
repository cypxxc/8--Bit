# 8bit

## Register
product for the admin workspace; brand for the public storefront.

## Users and purpose
The Thai-speaking shop owner manages service requests, prices and individual LINE customer conversations. The shop provides Windows/software setup, hardware upgrades and cleaning services. The owner requested a sidebar to make admin navigation easier.

## Brand personality
Preserve the existing 8-bit computer shop identity and dark navy, cyan and green theme. Use clear Thai labels for everyday administrative tasks.

## Design principles
Keep navigation visible on desktop and accessible through a menu on mobile. Give conversations sufficient space. Show status summaries in the jobs section. Support keyboard navigation, visible focus, native modal behavior and reduced motion. No external design references or special accessibility requirements have been specified.

## Approved landing content — preserve during visual or motion work

- Hero: “Windows, Software & Upgrade” / “ให้เหมาะกับการใช้งานของคุณ”. Use familiar English technical words with clear Thai copy.
- Services: Windows/software, device upgrades, cleaning/care, and Windows Local Account password reset for owners or authorized users. No circuit repair, network installation, data recovery, or custom-PC sales claims.
- Public service names come from the active catalog through `ServiceCatalog`; `lib/services.ts` provides group descriptions. Do not replace these with demo arrays.
- Device selection: exactly PC and Notebook. CRT scanlines default off. Keep the user's Motion/TiltCard, particle, BIOS and confetti features when editing content.
- No pricing section or price navigation. Visitors ask for an assessment through LINE OA; price editing stays in admin.
- Show the three service steps, not invented reviews, customer totals, success rates, turnaround times, guarantees or location details.
- `app/page.tsx` is the server entry point for metadata/catalog. `components/LandingPage.tsx` composes the animated public page. Do not replace the entry point with an old demo homepage.
- Intake must send `serviceIds` and a stable retry `idempotencyKey` to `/api/ticket`. Show only the ticket reference returned after successful persistence. Network errors must never create a success ticket.
