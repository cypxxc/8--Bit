# Admin Arcade Pixel 8-16bit Clean Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the `/admin` interface styling into a clean, high-precision 16-bit arcade console HUD (Neo-Geo / CPS-2 style) with crisp 1-2px stepped bevels, refined slate palettes, high-readability typography, and uncluttered layout spacing.

**Architecture:** Update `app/admin/admin.css` with unified 16-bit design tokens (stepped bevels, tactile buttons, recessed inputs, status colors) and refine components (`AdminSidebar.tsx`, `AdminApp.tsx`, `LineInbox.tsx`, `JobForm.tsx`, `ServiceEditor.tsx`) to adopt the clean arcade layout hierarchy while maintaining all sound effects, keyboard focus states, and administrative capabilities.

**Tech Stack:** Next.js (App Router), Tailwind CSS v4 / Vanilla CSS in `admin.css`, Lucide React icons, TypeScript, Vitest.

## Global Constraints

- Preserve all existing administrative workflows (Jobs CRUD, LINE chat push replies, Service catalog editing, Notifications retry).
- Preserve approved shop content and rules from `PRODUCT.md` and `AGENTS.md`.
- Preserve the retro 3D arcade push checkboxes (grey off, solid bright green on, no checkmark).
- Keep sound effects (`lib/sound.ts`) and focus-visible keyboard navigation (`2px solid #38bdf8`).
- Maintain full responsive support down to 375px mobile screens.

---

### Task 1: 16-Bit Design Tokens & Frame System in `admin.css`

**Files:**
- Modify: `app/admin/admin.css:1-350`
- Test: Build check (`npm run build`) & visual review

**Interfaces:**
- Produces: CSS variables and base utility classes for 16-bit stepped bevels (`--panel`, `--panel-elevated`, `--bevel-panel`, `--bevel-button`, `--bevel-input`).

- [ ] **Step 1: Update design tokens and base shell styling in `admin.css`**
Replace heavy 3-4px borders and excessive glow with:
```css
.admin-shell {
  --bg-deep: #070b14;
  --panel: #0c1322;
  --panel-elevated: #131d32;
  --panel-recessed: #060911;
  --line-frame: #1e2a3f;
  --line-highlight: #283b58;
  --line-shadow: #05080f;
  --neon-cyan: #38bdf8;
  --neon-emerald: #10b981;
  --neon-amber: #f59e0b;
  --neon-red: #ef4444;
  --neon-indigo: #818cf8;

  min-height: 100vh;
  background-color: var(--bg-deep);
  background-image: 
    radial-gradient(rgba(56, 189, 248, 0.04) 1px, transparent 1px),
    linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.15) 50%);
  background-size: 20px 20px, 100% 4px;
  color: #e2e8f0;
  font-family: var(--font-thai), system-ui, sans-serif;
  line-height: 1.5;
}
```

- [ ] **Step 2: Define 16-bit stepped bevels for `.admin-panel`, `.admin-button`, and `.admin-stat`**
```css
.admin-panel {
  background: var(--panel);
  border: 1px solid var(--line-frame);
  box-shadow: 
    inset 1px 1px 0 var(--line-highlight),
    inset -1px -1px 0 var(--line-shadow),
    2px 2px 0 #000000;
  padding: 20px;
}

.admin-button {
  font-family: var(--font-press-start), monospace;
  font-size: 9px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  min-height: 38px;
  background: #182236;
  border: 1px solid #000000;
  box-shadow: 
    inset 1px 1px 0 #3b4d6b,
    inset -1px -1px 0 #0a0f1b,
    2px 2px 0 #000000;
  color: #f1f5f9;
  cursor: pointer;
  letter-spacing: 0.5px;
  transition: all 0.08s ease;
}

.admin-button:hover:not(:disabled) {
  background: #22304c;
  color: #ffffff;
}

.admin-button:active:not(:disabled) {
  transform: translate(1px, 1px);
  box-shadow: 
    inset 1px 1px 0 #0a0f1b,
    inset -1px -1px 0 #3b4d6b,
    0 0 0 #000000;
}

.admin-button.primary {
  background-color: #065f46;
  color: #a7f3d0;
  box-shadow: 
    inset 1px 1px 0 #34d399,
    inset -1px -1px 0 #022c22,
    2px 2px 0 #000000;
}
.admin-button.primary:hover:not(:disabled) {
  background-color: #047857;
  color: #ffffff;
}
```

- [ ] **Step 3: Test compilation**
Run: `npm run build`
Expected: Build passes with updated base tokens.

- [ ] **Step 4: Commit changes**
```bash
git add app/admin/admin.css
git commit -m "style: apply 16-bit stepped bevels and clean arcade tokens"
```

---

### Task 2: Polish Navigation & Sidebar (`AdminSidebar.tsx` & CSS)

**Files:**
- Modify: `components/admin/AdminSidebar.tsx:1-54`
- Modify: `app/admin/admin.css:10-60`
- Test: Visual check of sidebar on desktop & mobile drawer

**Interfaces:**
- Consumes: `ADMIN_SECTIONS`, `tab`, `onSelect`, `onLogout`
- Produces: Clean 16-bit sidebar with active tab LED pip and refined monitor brand icon.

- [ ] **Step 1: Enhance `AdminSidebar.tsx` with 16-bit CRT brand framing and LED active indicator**
Ensure the brand icon has a crisp stepped border and active tab button includes an active LED indicator (`<span className="admin-nav-led" />`).

- [ ] **Step 2: Update sidebar styles in `admin.css`**
Refine `.admin-sidebar`, `.admin-sidebar-brand`, `.admin-sidebar-nav button`, and `.admin-mobile-bar`:
```css
.admin-sidebar {
  background: #080d19;
  border-right: 1px solid var(--line-frame);
  box-shadow: inset -1px 0 0 var(--line-shadow);
  padding: 24px 14px 20px;
}

.admin-sidebar-nav button {
  position: relative;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  color: #94a3b8;
  border: 1px solid transparent;
  font-size: 14px;
}

.admin-sidebar-nav button[aria-current="page"] {
  background: #0d1a2d;
  color: #38bdf8;
  border: 1px solid #1e3a5f;
  box-shadow: 
    inset 1px 1px 0 rgba(56, 189, 248, 0.2),
    inset -1px -1px 0 #05080f;
  font-weight: 600;
}
```

- [ ] **Step 3: Test compilation**
Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit changes**
```bash
git add components/admin/AdminSidebar.tsx app/admin/admin.css
git commit -m "style: polish admin sidebar with 16-bit arcade console styling"
```

---

### Task 3: Polish Stat Pods, Toolbar & Job Dockets (`AdminApp.tsx` & CSS)

**Files:**
- Modify: `app/admin/admin.css:260-460`
- Modify: `components/admin/AdminApp.tsx:36-53, 538-605`
- Test: Unit tests `npm run test`

**Interfaces:**
- Consumes: `counts`, `jobs`, `STATUS_ICONS`, `STATUS_COLORS`
- Produces: 16-bit HUD stat pods, recessed search/filter toolbar, and clean docket job cards.

- [ ] **Step 1: Update Stat Pod styling in `admin.css`**
Make `.admin-stat` look like an arcade HUD monitor with micro status indicator line and crisp tabular count.
```css
.admin-stat {
  background: var(--panel);
  border: 1px solid var(--line-frame);
  box-shadow: 
    inset 1px 1px 0 var(--line-highlight),
    inset -1px -1px 0 var(--line-shadow),
    2px 2px 0 #000000;
  padding: 12px 14px;
}

.admin-stat strong {
  font-family: var(--font-press-start), monospace;
  font-size: 20px;
  margin-top: 4px;
}
```

- [ ] **Step 2: Update Job Docket Card styling in `admin.css`**
Style `.admin-job` with crisp docket headers, clear customer names, tabular price displays, and 16-bit status pills:
```css
.admin-job {
  background: var(--panel);
  border: 1px solid var(--line-frame);
  box-shadow: 
    inset 1px 1px 0 var(--line-highlight),
    inset -1px -1px 0 var(--line-shadow),
    2px 2px 0 #000000;
  padding: 14px 18px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 14px;
}
.admin-job:hover {
  background: var(--panel-elevated);
  border-color: var(--neon-cyan);
  transform: translateX(2px);
}
```

- [ ] **Step 3: Run existing tests to verify zero regressions**
Run: `npm run test`
Expected: All test suites pass.

- [ ] **Step 4: Commit changes**
```bash
git add components/admin/AdminApp.tsx app/admin/admin.css
git commit -m "style: upgrade stat pods and job dockets to clean 16-bit HUD"
```

---

### Task 4: Polish LINE Inbox & Communication Console (`LineInbox.tsx` & CSS)

**Files:**
- Modify: `app/admin/admin.css:700-1230`
- Modify: `components/admin/LineInbox.tsx:1-120`
- Test: Unit tests `tests/admin-inbox-api.test.ts` & build check

**Interfaces:**
- Consumes: `Room`, `Message`, `IntakeSummary`
- Produces: Clean split-pane comms deck with 16-bit intake docket, chat bubbles, and tactile compose box.

- [ ] **Step 1: Refine `.line-inbox`, `.line-rooms`, and `.line-room`**
Replace heavy 6px shadows with clean 16-bit console frame:
```css
.line-inbox {
  background: var(--panel);
  border: 1px solid var(--line-frame);
  box-shadow: 
    inset 1px 1px 0 var(--line-highlight),
    inset -1px -1px 0 var(--line-shadow),
    3px 3px 0 #000000;
}
```

- [ ] **Step 2: Refine Intake Card and Message Bubbles**
Make `.line-intake-card` look like a clean 16-bit diagnostic printout with cyan borders and clear 2-column key-value grid.
Make `.line-bubble` have clean 1px borders, with `.line-bubble.is-shop` in crisp emerald matrix style.

- [ ] **Step 3: Run unit tests**
Run: `npm run test tests/admin-inbox-api.test.ts`
Expected: PASS

- [ ] **Step 4: Commit changes**
```bash
git add components/admin/LineInbox.tsx app/admin/admin.css
git commit -m "style: polish LINE inbox with clean 16-bit comms console aesthetic"
```

---

### Task 5: Polish Job Drawer Modal, Service Editor & Checkboxes (`JobForm.tsx`, `ServiceEditor.tsx` & CSS)

**Files:**
- Modify: `app/admin/admin.css:460-630, 675-700`
- Modify: `components/admin/JobForm.tsx`
- Modify: `components/admin/ServiceEditor.tsx`
- Test: `npm run test` & `npm run build`

**Interfaces:**
- Consumes: `Job`, `ServiceRecord`, `SERVICE_GROUPS`
- Produces: Clean 16-bit drawer modal, polished service cards, and preserved 3D push-switch checkboxes.

- [ ] **Step 1: Polish `.admin-drawer` and form controls**
Refine drawer framing with clean 16-bit border and smooth scroll.
Ensure inputs and textareas retain recessed styling:
```css
.admin-drawer {
  background: #080d18;
  border-left: 1px solid var(--line-frame);
  box-shadow: 
    inset 1px 0 0 var(--line-highlight),
    -4px 0 12px rgba(0, 0, 0, 0.6);
  padding: 24px;
}
```

- [ ] **Step 2: Preserve and polish retro push-switch checkboxes**
Ensure `.admin-workspace input[type="checkbox"]` retains the approved grey-off / bright-green-on style with 1px bevels and zero checkmark pseudo-elements.

- [ ] **Step 3: Polish `.admin-service` cards**
2-column grid with clean 16-bit docket styling, price tag in neon amber/cyan, and tactile action buttons.

- [ ] **Step 4: Run full verification suite**
Run: `npm run test` and `npm run build`
Expected: All tests pass and build succeeds cleanly.

- [ ] **Step 5: Commit changes**
```bash
git add components/admin/JobForm.tsx components/admin/ServiceEditor.tsx app/admin/admin.css
git commit -m "style: refine job drawer modal and service catalog to 16-bit clean"
```

---

## Plan Verification Checklist

- [ ] `npm run test` passes without errors.
- [ ] `npm run build` completes successfully with zero type or CSS compilation errors.
- [ ] Visual verification of all 4 tabs (`jobs`, `inbox`, `services`, `notifications`).
- [ ] Responsive layout behaves correctly on mobile (<=600px) and desktop (>1000px).
- [ ] Sound effects and keyboard focus outlines remain functional and crisp.
