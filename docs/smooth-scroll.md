# Landing smooth scroll

The original CSS `scroll-behavior: smooth` did not interpolate wheel input. Browser reproduction moved the full 700px within the first 30ms.

Added pinned Lenis 1.3.26 on the landing page only, with lerp 0.12 and native touch scrolling. Same-page link handling waits for mobile menu collapse, prevents competing native animation, respects section margins, updates the hash and focuses the destination. Reduced-motion preference changes destroy/recreate the instance; open dialogs/body locks pause it; unmount cleans up listeners and animation resources. Admin remains native.

Verified in headless Edge on localhost:3000: wheel moved 212px early and settled at 700px, anchor target settled 110.5px below the top, background stayed fixed while the service dialog was open and resumed after its exit animation, reduced-motion disabled Lenis, admin had no Lenis instance. Production build and focused ESLint passed. Source: https://github.com/darkroomengineering/lenis.
