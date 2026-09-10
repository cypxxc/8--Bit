# Design Specification: Admin Arcade Pixel 8-16bit Clean Redesign

- **Date:** 2026-09-10
- **Project:** 8bit
- **Status:** Approved by User
- **Author:** Antigravity (AI Assistant) & Shop Owner
- **Reference Skills:** `brainstorming`, `design-system-builder`

---

## 1. Overview & Objective

The 8-bit computer shop admin workspace (`/admin`) serves the shop owner for managing repair/service tickets, customer pricing, service catalogs, and live LINE chat conversations.

While the existing retro aesthetic is appreciated, the current interface exhibits visual friction:
1. Chunky 3-4px black drop-shadows and thick dark borders make cards and panels feel bulky and visually heavy.
2. Neon glows and scanlines add unnecessary noise during long operating hours.
3. Typography scale between pixel font (`Press Start 2P`) and Thai system font needs clearer boundaries for readability.
4. Spacing and component borders vary slightly across tabs (Jobs, LINE Inbox, Services, Notifications).

**Objective:**
Elevate the admin workspace into a **Clean, High-Precision 16-Bit Arcade Console HUD (Neo-Geo / CPS-2 style)**. The redesign delivers crisp 1-2px multi-tone stepped bevels, a refined dark arcade slate palette, high-readability typography, and uncluttered layout spacing, while preserving all tactile feedback, sound effects, retro personality, and administrative capabilities.

---

## 2. Visual Tokens & Theme Architecture

### 2.1 Color Palette & Surfaces
- **App Shell Deep Background:** `#070b14` (Deep Arcade Slate). Replaces flat harsh black. Subtle micro-grid (`radial-gradient(rgba(56, 189, 248, 0.04) 1px, transparent 1px) 20px 20px`), scanline opacity reduced to 0.02.
- **Base Panel Surface:** `#0c1322` (Rich Navy Charcoal).
- **Elevated / Hover Panel Surface:** `#131d32` (Lighter Arcade Deck).
- **Recessed Surface (Inputs, Message Thread, Inner Wells):** `#060911` with crisp inner shadows.
- **Border Frame Lines:** `#1e2a3f` (Primary Frame), `#283b58` (Highlight Edge), `#05080f` (Shadow Edge).

### 2.2 16-Bit Stepped Bevel System (Crisp 1-2px)
Replace heavy `3px solid #1e293b; box-shadow: 0 0 0 2px #000, 4px 4px 0 0 #000;` with high-precision 16-bit console framing:
```css
/* Standard 16-Bit Panel Frame */
border: 1px solid #1e2a3f;
box-shadow: 
  inset 1px 1px 0 #283b58,
  inset -1px -1px 0 #05080f,
  2px 2px 0 #000000;
```
For elevated/interactive cards on hover:
```css
/* Hover / Active Focus Bevel */
border-color: #38bdf8;
box-shadow: 
  inset 1px 1px 0 rgba(56, 189, 248, 0.4),
  inset -1px -1px 0 #05080f,
  2px 2px 0 #000000;
```

### 2.3 Tactile Arcade Push Buttons
- **Default Button:** 
  - Background `#182236`, border `1px solid #000`.
  - Bevel: `inset 1px 1px 0 #3b4d6b, inset -1px -1px 0 #0a0f1b, 2px 2px 0 #000`.
  - Active: `transform: translate(1px, 1px)`, bevel reversed, drop-shadow `0 0 0`.
- **Primary / Action Button:** 
  - Background `#065f46` (Emerald), text `#34d399`.
  - Bevel: `inset 1px 1px 0 #34d399, inset -1px -1px 0 #022c22, 2px 2px 0 #000`.
- **Danger Button:**
  - Background `#7f1d1d` (Crimson), text `#fca5a5`.
  - Bevel: `inset 1px 1px 0 #f87171, inset -1px -1px 0 #450a0a, 2px 2px 0 #000`.

### 2.4 Controlled Retro Status Palette
- **Pending (รับเรื่องใหม่):** Cyber Cyan (`#0284c7` bg, `#38bdf8` text/border).
- **Received (รับเครื่องแล้ว):** Muted Indigo (`#3730a3` bg, `#818cf8` text/border).
- **Working (กำลังดำเนินการ):** Arcade Amber (`#78350f` bg, `#f59e0b` text/border).
- **Ready (เสร็จเรียบร้อย):** Emerald Matrix (`#064e3b` bg, `#34d399` text/border).
- **Delivered (ส่งมอบแล้ว):** Slate Grey (`#1e293b` bg, `#94a3b8` text/border).
- **Cancelled (ยกเลิก):** Crimson Red (`#7f1d1d` bg, `#f87171` text/border).

### 2.5 Typography Hierarchy
- **Header Badges & Technical Codes:** `Press Start 2P`, 8px to 11px, `letter-spacing: 0.5px`, crisp contrast.
- **Titles & Headings:** Thai UI font with clear weight hierarchy (20px-24px for H1, 15px-17px for H2, 13px-14px for H3), paired with uppercase 8-bit kickers (`admin-kicker`).
- **Data & Tables:** Tabular figures (`font-variant-numeric: tabular-nums`) with 13px-14px font size for comfortable scanning of customer names, dates, amounts, and notes.

---

## 3. Component Specifications

### 3.1 Sidebar & Mobile Bar (`AdminSidebar.tsx`)
- Keep persistent sidebar on desktop (248px width) and accessible drawer modal on mobile.
- Brand header: Mini arcade CRT monitor icon in emerald/cyan container with `8BIT` logo and status badge.
- Navigation buttons:
  - Clean 16-bit tab items with crisp active state: `#0e1f2b` background, `#38bdf8` border, glowing 4px LED pip on the left.
  - Hover state: `#131d32` with subtle cyan indicator.
- Footer account info: Clean bordered sub-panel displaying current authenticated email and tactile logout button.

### 3.2 Arcade Stat Pods Grid (`AdminApp.tsx`)
- 6-column grid displaying real-time job counts by status.
- Each pod styled as a 16-bit HUD monitor gauge:
  - Top row: Status label in Thai + small status emoji icon.
  - Middle: Big bold count in `Press Start 2P` (22px) with crisp status color.
  - Bottom: Micro LED bar indicating active filter state.
- Interactive: Clicking a pod instantly filters the job list with smooth tactile click feedback.

### 3.3 Search & Filter Toolbar
- Single unified control bar with 16-bit recessed input wells (`inset 1px 1px 0 #000, inset -1px -1px 0 #1e293b`).
- Integrated status dropdown with matching 16-bit bevel.
- "เพิ่มงานใหม่" (New Job) button highlighted in emerald with tactile push action.

### 3.4 Job List & Docket Cards
- Work-order cards styled as clean maintenance dockets:
  - Header line: Ticket Code (`#00f0ff` pixel badge) + Date / Time + Status Pill.
  - Customer line: Customer Name (bold white) + Phone / Device (PC / Notebook badge).
  - Issue line: Description snippet in muted slate with clear line clamp.
  - Price & payment: Tabular price formatting (e.g. `฿1,500`) with paid/unpaid indicators.
- Hover effect: Subtle left-shift (3px) with Cyan border highlight and crisp shadow.

### 3.5 Job Form & Drawer (`JobForm.tsx`)
- Sliding right drawer with backdrop blur and 16-bit chassis border.
- Clean two-column grid for inputs (Device, Customer Name, Contact, Status, Price, Payment Status).
- Service selector checkboxes: Maintain the approved retro 3D arcade push-switch (grey off, solid green on, no checkmark).
- Sticky action footer with "บันทึกข้อมูลงาน" (Primary Emerald) and "ปิดหน้าต่าง" (Slate).

### 3.6 LINE Customer Inbox (`LineInbox.tsx`)
- **Left Room List:**
  - Search bar + "เฉพาะยังไม่อ่าน" (Unread filter toggle).
  - Room cards with avatar icon, customer name, latest message preview, unread count pill, and intake status badge (`NEW`, `DIAGNOSIS`, `COMPLETED`).
- **Right Chat Console:**
  - Header: Customer name, LINE user ID snippet, "สร้างงานจากแชตนี้" button, and intake summary toggle button.
  - **Intake Summary Docket:** Clean 16-bit collapsible card displaying customer intent, device, requested service, and issue description.
  - **Chat Message Thread:**
    - Recessed dark background (`#060911`).
    - Customer message bubbles: Left-aligned, dark slate (`#131c30`), clean 1px border.
    - Shop owner message bubbles: Right-aligned, emerald matrix (`#064e3b` / `#047857`), clean 1px border.
    - Timestamps formatted cleanly in VT323/monospace.
  - **Compose Box:**
    - Recessed textarea with prompt placeholder.
    - Tactile Send button with shortcut hint (`Enter` เพื่อส่ง, `Shift+Enter` ขึ้นบรรทัดใหม่).

### 3.7 Service Catalog Editor (`ServiceEditor.tsx`)
- 2-column grid of service cards categorized by group (Software, Upgrade, Cleaning).
- Service card: Clean 16-bit docket containing service name, description, price badge, active status switch, and quick edit/delete actions.
- "เพิ่มบริการใหม่" collapsible drawer with clean input fields.

---

## 4. Error Handling, Accessibility & Polish

1. **Focus States & Keyboard Navigation:**
   - All interactive elements (buttons, inputs, links, tabs, checkboxes) retain high-contrast `2px solid #38bdf8` focus-visible outline with 2px offset.
2. **Reduced Motion:**
   - Honor `prefers-reduced-motion: reduce` by disabling transforms, shifts, and animations, preserving instantaneous state changes.
3. **Sound Effects:**
   - Maintain the existing `sound` integration (laser, victory, click, powerup) with mute persistence.
4. **Color Contrast:**
   - All text colors against dark slate backgrounds exceed WCAG AA contrast ratio (minimum 4.5:1 for body copy, 3:1 for large pixel titles).

---

## 5. Verification Plan

1. **Visual Regression & Layout Checks:**
   - Inspect `/admin` on desktop (1440px), laptop (1200px), tablet (768px), and mobile (375px).
   - Verify that all 4 main tabs (`jobs`, `inbox`, `services`, `notifications`) render cleanly with consistent 16-bit stepped borders.
2. **Functional Checks:**
   - Filter jobs by clicking stat pods, search query, and status dropdown.
   - Open JobForm drawer, edit a job, verify save, sound effect, and close.
   - Switch to LINE Inbox, select a conversation, verify intake card display, type and send a reply.
   - Switch to Service Catalog, toggle active status, add a new service, verify persistence.
3. **Automated Test Suite:**
   - Run `npm run test` to verify no regressions in admin API endpoints and business logic.
   - Run `npm run build` to verify Next.js build passes cleanly without CSS or TypeScript errors.
