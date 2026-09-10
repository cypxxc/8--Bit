# Retro 8-bit Checkbox & Service Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform small, browser-native checkboxes into tactile, responsive Retro Arcade Selection Cards on both the storefront ticket terminal and the admin management console.

**Architecture:** Update `components/RepairTicketTerminal.tsx` to render service items as accessible, touch-friendly 8-bit cards with 24px custom pixel checkbox indicators and audio feedback. Update `app/admin/admin.css` to style `.admin-checks` into an auto-filling grid of interactive retro cards and custom 20px pixel checkboxes (`appearance: none`, glowing checkmarks), while preserving full native form data submission (`name="serviceIds"`).

**Tech Stack:** Next.js (React 19), Tailwind CSS, Custom 8-bit CSS, Web Audio API.

## Global Constraints

- Preserve approved shop content and rules from `AGENTS.md` and `PRODUCT.md`.
- Preserve form submission compatibility for `JobForm.tsx` (`name="serviceIds"`).
- Maintain sound effects (`sound.playSelect()`) when customer toggles service cards.
- Full responsive support for mobile (360px+) and desktop screens.

---

### Task 1: Storefront Retro Service Selection Cards

**Files:**
- Modify: `components/RepairTicketTerminal.tsx:180-210`

**Interfaces:**
- Consumes: `services`, `category`, `serviceIds`, `setServiceIds`, `sound.playSelect()`.
- Produces: Accessible 8-bit interactive cards with large 24px pixel checkbox indicators, neon borders, and sound effects.

- [ ] **Step 1: Inspect and update service list markup in `components/RepairTicketTerminal.tsx`**

Replace lines 189-194 with responsive retro selection cards:
```tsx
<div className="grid sm:grid-cols-2 gap-2 bg-[#05080e] p-3 border-2 border-[#1e293b]">
  {services.filter(service => service.group_id === category).map(service => {
    const isSelected = serviceIds.includes(service.id);
    return (
      <div
        key={service.id}
        role="checkbox"
        aria-checked={isSelected}
        tabIndex={0}
        onClick={() => {
          sound.playSelect();
          setServiceIds(ids => isSelected ? ids.filter(id => id !== service.id) : [...ids, service.id]);
        }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            sound.playSelect();
            setServiceIds(ids => isSelected ? ids.filter(id => id !== service.id) : [...ids, service.id]);
          }
        }}
        className={`group p-3 border-2 text-sm font-thai transition-all cursor-pointer select-none flex items-center gap-3 shadow-[2px_2px_0_#000] active:scale-[0.98] ${
          isSelected
            ? "border-[#39ff14] text-white bg-[#064e3b] shadow-[2px_2px_0_#000,0_0_12px_rgba(57,255,20,0.25)]"
            : "border-[#1e293b] text-[#cbd5e1] bg-[#070b14] hover:border-[#38bdf8] hover:bg-[#0c1220]"
        }`}
      >
        <div
          className={`w-6 h-6 flex-shrink-0 border-2 flex items-center justify-center transition-all ${
            isSelected
              ? "border-[#39ff14] bg-[#022c22] text-[#39ff14] shadow-[0_0_8px_#39ff14]"
              : "border-[#334155] bg-[#05080e] group-hover:border-[#38bdf8]"
          }`}
        >
          {isSelected && <span className="font-bold text-sm leading-none select-none">✔</span>}
        </div>
        <span className="font-medium flex-1 leading-snug">{service.name}</span>
      </div>
    );
  })}
</div>
```

- [ ] **Step 2: Verify component rendering and TypeScript compilation**

Run: `npx tsc --noEmit`.

- [ ] **Step 3: Commit storefront changes**

`git add components/RepairTicketTerminal.tsx`
`git commit -m "feat(ui): redesign storefront service checkboxes into retro arcade selection cards"`

---

### Task 2: Admin Checks Grid & Custom Pixel Checkboxes

**Files:**
- Modify: `app/admin/admin.css:630-660, 380-420`

**Interfaces:**
- Consumes: `.admin-checks`, `.admin-checks label`, `.admin-checks input[type="checkbox"]`, `.line-unread-filter input[type="checkbox"]`.
- Produces: Polished 8-bit card grid in admin job creation and custom 20px pixel checkbox indicators.

- [ ] **Step 1: Add custom retro checkbox and card styles in `app/admin/admin.css`**

Add CSS rules:
```css
/* Custom 20px Retro Checkbox Inputs */
.admin-checks input[type="checkbox"],
.line-unread-filter input[type="checkbox"],
.admin-row input[type="checkbox"] {
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
  box-shadow: 1px 1px 0 #000;
}

.admin-checks input[type="checkbox"]:hover,
.line-unread-filter input[type="checkbox"]:hover,
.admin-row input[type="checkbox"]:hover {
  border-color: #38bdf8;
}

.admin-checks input[type="checkbox"]:checked,
.line-unread-filter input[type="checkbox"]:checked,
.admin-row input[type="checkbox"]:checked {
  background: #022c22;
  border-color: #39ff14;
  box-shadow: 0 0 8px rgba(57, 255, 20, 0.4);
}

.admin-checks input[type="checkbox"]:checked::after,
.line-unread-filter input[type="checkbox"]:checked::after,
.admin-row input[type="checkbox"]:checked::after {
  content: "✔";
  color: #39ff14;
  font-size: 13px;
  font-weight: 900;
  line-height: 1;
}

/* Admin Checks Card Grid */
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
```

- [ ] **Step 2: Commit admin CSS changes**

`git add app/admin/admin.css`
`git commit -m "feat(ui): redesign admin checkboxes into retro arcade cards and custom pixel indicators"`

---

### Task 3: Full Verification & Production Build

- [ ] **Step 1: Run TypeScript typecheck**

Run: `npx tsc --noEmit`.

- [ ] **Step 2: Run all test suites**

Run: `npx tsx tests/line-commands.test.ts; npx tsx tests/line-types.test.ts; npx tsx tests/line-push.test.ts; npx tsx tests/line-reply-route.test.ts; npx tsx tests/line-reply-e2e.test.ts; npx tsx tests/line-intake-e2e.test.ts`.

- [ ] **Step 3: Run production build**

Run: `npm run build`.

- [ ] **Step 4: Finalize and commit**

`git commit --allow-empty -m "chore: verify production build for retro checkbox redesign"`
