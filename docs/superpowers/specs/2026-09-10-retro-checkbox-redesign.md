# Design Specification: Retro 8-bit Checkbox & Service Selection Redesign

- **Date:** 2026-09-10
- **Project:** 8bit
- **Status:** Approved by User
- **Author:** Antigravity (AI Assistant) & Shop Owner

---

## 1. Overview & Problem Statement
Currently, service selections and boolean options across both the public-facing storefront (`RepairTicketTerminal.tsx`) and the owner management console (`JobForm.tsx`, `LineInbox.tsx`) rely on default, browser-native `<input type="checkbox">` elements. These native inputs are visually small (~13px), awkward to tap on mobile touchscreens, and break the immersive retro 8-bit arcade aesthetic of the shop.

This redesign elevates all checkboxes into tactile, responsive **Retro Arcade Selection Cards** with large custom pixel checkboxes (20–24px), bold neon indicators (`#39ff14`), glowing borders, and broad touch targets.

---

## 2. Key Requirements & Scope

1. **Storefront Customer Terminal (`RepairTicketTerminal.tsx`):**
   - Transform each service item in the service list into an interactive card button.
   - Large touch target: the entire card area is clickable/tappable.
   - Custom 24x24px pixel checkbox box with a crisp neon checkmark (`✔`).
   - Active state: Emerald pixel background (`#064e3b`), neon green border (`#39ff14`), retro 2px drop shadow (`shadow-[2px_2px_0_#000]`), and subtle green glow.
   - Audio feedback: Trigger retro select sound (`sound.playSelect()`) on toggle.
   - Accessible keyboard navigation (`Space`/`Enter` support, proper ARIA attributes).
2. **Owner Backend Admin (`JobForm.tsx` & `admin.css`):**
   - Upgrade `.admin-checks` into a responsive grid of retro arcade cards (`repeat(auto-fill, minmax(220px, 1fr))`).
   - Replace native browser checkboxes with custom styled 20x20px pixel boxes with glowing checkmarks via CSS `appearance: none`.
   - Selected cards light up with emerald green background (`#064e3b`), bright border (`#34d399`), and 8-bit drop shadow.
   - Full native form compatibility preserved: form submissions continue to serialize `name="serviceIds"` naturally.
3. **Admin Filter Checkboxes (`LineInbox.tsx` & `admin.css`):**
   - Apply the custom 8-bit checkbox styling to `.line-unread-filter input[type="checkbox"]` for visual consistency.

---

## 3. Component & Visual Styling Specifications

### 3.1 Storefront Service Card (`RepairTicketTerminal.tsx`)

```tsx
<div
  role="checkbox"
  aria-checked={isSelected}
  tabIndex={0}
  onClick={() => toggleService(service.id)}
  onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && toggleService(service.id)}
  className={`group p-3 border-2 text-sm font-thai transition-all cursor-pointer select-none flex items-center gap-3 shadow-[2px_2px_0_#000] ${
    isSelected
      ? "border-[#39ff14] text-white bg-[#064e3b] shadow-[2px_2px_0_#000,0_0_12px_rgba(57,255,20,0.25)]"
      : "border-[#1e293b] text-[#cbd5e1] bg-[#070b14] hover:border-[#38bdf8] hover:bg-[#0c1220]"
  }`}
>
  {/* Custom 24px 8-bit Checkbox Indicator */}
  <div
    className={`w-6 h-6 flex-shrink-0 border-2 flex items-center justify-center transition-all ${
      isSelected
        ? "border-[#39ff14] bg-[#022c22] text-[#39ff14] shadow-[0_0_8px_#39ff14]"
        : "border-[#334155] bg-[#05080e] group-hover:border-[#38bdf8]"
    }`}
  >
    {isSelected && <span className="font-bold text-sm leading-none">✔</span>}
  </div>
  <span className="font-medium flex-1">{service.name}</span>
</div>
```

### 3.2 Admin Checks Grid (`app/admin/admin.css`)

```css
.admin-checks {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
  margin-top: 8px;
}

.admin-checks label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #0c1220;
  border: 2px solid #1e293b;
  box-shadow: 2px 2px 0 #000;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 13px;
  color: #cbd5e1;
  user-select: none;
}

.admin-checks label:hover {
  border-color: #38bdf8;
  background: #141f35;
  color: #ffffff;
}

.admin-checks label:has(input:checked) {
  background: #064e3b;
  border-color: #34d399;
  box-shadow: 2px 2px 0 #000, 0 0 10px rgba(52, 211, 153, 0.2);
  color: #ffffff;
}

/* Custom 20px Retro Checkbox Input */
.admin-checks input[type="checkbox"],
.line-unread-filter input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #334155;
  background: #05080e;
  margin: 0;
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.admin-checks input[type="checkbox"]:hover,
.line-unread-filter input[type="checkbox"]:hover {
  border-color: #38bdf8;
}

.admin-checks input[type="checkbox"]:checked,
.line-unread-filter input[type="checkbox"]:checked {
  background: #022c22;
  border-color: #39ff14;
  box-shadow: 0 0 6px rgba(57, 255, 20, 0.4);
}

.admin-checks input[type="checkbox"]:checked::after,
.line-unread-filter input[type="checkbox"]:checked::after {
  content: "✔";
  color: #39ff14;
  font-size: 13px;
  font-weight: 900;
  line-height: 1;
}
```

---

## 4. Verification Plan

1. **Visual & Touch Target Inspection:**
   - Verify that clicking anywhere on the service card in `RepairTicketTerminal` toggles the selection and plays the select sound.
   - Verify that selected items appear in the counter summary `"เลือกแล้ว X รายการ"`.
   - Verify that in `/admin` job modal, checkboxes render as large 8-bit cards and properly submit selected service IDs.
   - Verify `.line-unread-filter` checkboxes render with custom 8-bit indicators.
2. **Accessibility:**
   - Keyboard focus and Space/Enter selection working on cards.
   - Screen-reader friendly with proper ARIA attributes.
3. **Build & Type Check:**
   - `npm run build` passes with zero errors.
