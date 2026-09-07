# Landing restoration — 2026-09-07

The motion update had replaced the server homepage and several service components with demo content. The active Supabase service catalog, admin routes and LINE integration were still present.

Restored the approved Windows/Software/Upgrade hero, four real service groups, PC and Notebook devices, CRT-off default, chat-first pricing, factual service steps and FAQs. Removed the public price matrix, custom-PC configurator and invented customer reviews from the rendered page. Admin price management remains available.

Kept Motion transitions, TiltCard, the BIOS control, cursor particles, animated FAQ and success confetti. The motion component files were not overwritten. The composition is in `components/LandingPage.tsx`; `app/page.tsx` again loads the active catalog and supplies metadata. `PRODUCT.md` and `AGENTS.md` now record the approved content constraints for future visual work.

Repaired intake integration: real active service IDs, stable UUID across retries, bounded/labelled inputs, POST-only submission, hydration guard, no duplicate clicks while pending, inline errors, and success only with the server-returned ticket reference. A mobile overflow in the terminal header was fixed.

Verification: production build and focused ESLint passed; 11 validation/security/webhook unit tests passed. Production-browser checks passed for hero/copy, absence of prices/configurator/demo reviews, device options, CRT default, service modal/Escape, mobile navigation/no overflow, missing selection, HTTP failure, network failure, retry UUID reuse and server-reference success. The ticket endpoint was intercepted in the test browser, so no actual customer record or LINE notification was created. Confirmed the restored page is served at localhost:3000. No production deployment performed.

Pre-restoration copies are in ignored `work/landing-before-restore/` with `.bak` suffixes. They contain the incoming motion version, not the final restored version. Do not run the one-off restoration scripts again over later user changes.
