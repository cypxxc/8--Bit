# 👾 8-Bit Computer Shop & Admin Workspace

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)
[![LINE OA](https://img.shields.io/badge/LINE_OA-Messaging_API-00c300?style=flat-square&logo=line)](https://developers.line.biz/)

> **8bit** combines an authentic 8-bit retro arcade storefront for computer repairs and upgrades with a dedicated management portal for shop owners.

---

## 🕹️ Highlights & Features

### 1. Retro Arcade Storefront (Public)
- **Authentic 8-bit Aesthetic**: Dark navy (`#090b10`), cyberpunk cyan (`#00f0ff`), arcade green (`#39ff14`), and neon amber accents with pixelated typography (`VT323`, `Press Start 2P`).
- **Interactive Audio & Visuals**: Synthesized Web Audio 8-bit sound effects (jump, coin, laser, power-up, victory), interactive BIOS boot screen sequence, toggleable CRT scanlines, and cursor pixel dust trails.
- **Active Service Catalog**: Live integration with `/api/services` fetching available services:
  - Windows & essential software setup
  - Hardware upgrades & parts installation (PC & Notebook)
  - Deep cleaning, thermal paste re-application & maintenance
  - Windows Local Account password reset for authorized machine owners
- **Repair Ticket Terminal (Quest Log)**: Interactive job intake with client-side validation, idempotency key generation (`crypto.randomUUID()`) to safely handle retries without duplicate records, and instant receipt references.
- **PC Rig Builder**: Interactive parts picker and power budget / wattage estimator with retro confetti celebration.
- **LINE OA Integration**: Seamless consultation handoff to LINE Official Account (`@356qitzh`) with chat-first pricing assessments.
- **Anti-Inspect Easter Egg**: Interactive retro arcade trap and console easter eggs for playful developer defense.

### 2. Shop Owner Administration Portal (`/admin`)
- **Protected Access**: Authenticated via Supabase Auth and restricted through server-verified `shop_admins` records. Zero anonymous public table permissions.
- **Service Job Pipeline**: Search, filter, and update repair jobs (Status progression: `intake` ➔ `queued` ➔ `in-progress` ➔ `testing` ➔ `ready` ➔ `completed` ➔ `cancelled`). Optimistic concurrency protection using record version checks prevents overwrite collisions.
- **Live LINE Customer Inbox**: Read incoming customer messages, view media/attachments directly from LINE Webhook streams, view live intake status badges (`new`, `awaiting_device`, `awaiting_service`, `awaiting_issue`, `completed`), and perform one-click job prefill into the Service Job Pipeline.
- **Catalog & Price Matrix Editor**: Adjust service titles, descriptions, starting prices, and toggle public visibility in real time.
- **Notification Audit Log**: Track outbound LINE notifications, idempotency keys, and trigger retries for failed dispatches.

### 3. LINE OA Intake Chatbot & Technician Handoff
- **State-Driven Intake Workflow**: Automated guided intake via LINE Messaging API Webhooks:
  1. **Greeting (`new`)**: Welcomes the customer on first interaction and provides Quick Reply device selection (`คอมพิวเตอร์ตั้งโต๊ะ (PC)` vs `โน้ตบุ๊ก (Notebook)`).
  2. **Device Selection (`awaiting_device`)**: Records device choice and prompts with service quick replies (`ลง Windows / โปรแกรม`, `อัปเกรดเครื่อง (RAM/SSD)`, `ตรวจเช็ก / ทำความสะอาด`, `ปรึกษาอาการทั่วไป`).
  3. **Service Selection (`awaiting_service`)**: Stores chosen service category and prompts for symptom description or photo attachments.
  4. **Issue Description (`awaiting_issue`)**: Records customer problem description or photos, advancing to `completed` with a `completed_at` timestamp.
  5. **Completion & Human Handoff (`completed`)**: Confirms receipt and remains completely silent on subsequent messages so technicians can consult naturally without bot interference.
- **Customer Reset Keyword**: Customers can send `เริ่มใหม่`, `reset`, or `/reset` anytime to reset conversation state back to device selection.
- **Admin One-Click Job Prefill**: Shop technicians viewing any conversation in `/admin` can click **"⚡ สร้างใบงานจากข้อมูลแชต"** to automatically populate `customer_name`, `device_type`, `description`, and `line_id` into the repair job form.
- **Manual Intake Control**: Technicians can reset or adjust customer intake state directly from the inbox action bar (`/api/admin/inbox/intake`).

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI & Animation**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Motion](https://motion.dev/) (`motion/react`), [Lenis](https://lenis.darkroom.engineering/) smooth scroll, [Lucide React](https://lucide.dev/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security, Supabase SSR, Edge Functions)
- **Messaging**: LINE Messaging API with HMAC-SHA256 signature verification and Edge Function webhooks
- **Validation & Security**: [Zod 4](https://zod.dev/), client IP rate limiting, CSRF origin verification, parameterized queries

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20.x or higher
- **npm** / **pnpm** / **yarn**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/cypxxc/8--Bit.git
   cd 8--Bit
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and fill in the necessary keys:
   ```bash
   cp .env.example .env.local
   ```
   Key variables include:
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Supabase anon/publishable key
   - `SUPABASE_SECRET_KEY`: Supabase service role secret (server only)
   - `LINE_CHANNEL_ACCESS_TOKEN`: LINE Messaging API channel access token
   - `LINE_CHANNEL_SECRET`: LINE Channel secret for webhook HMAC verification
   - `LINE_ADMIN_USER_ID`: Shop owner LINE User ID for alerts
   - `LINE_BOT_USER_ID`: LINE Bot destination ID

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the storefront, or [http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard.

---

## 🔒 Owner Provisioning

To provision or set up an initial shop owner account:

```bash
npx tsx scripts/provision-owner.ts owner@example.com
```

This creates the administrative record in `shop_admins` and outputs a one-time setup token link in `.env.owner-setup` (git-ignored) to set a secure password.

---

## 🧪 Testing & Verification

Run tests and verification commands:

```bash
# Run all automated test suites (unit, webhook, database, bot state machine, and e2e)
npx tsx --test tests/*.test.ts

# Run ESLint validation
npm run lint

# Compile and verify Next.js production build
npm run build

# Run specific test suites individually
npx tsx --test tests/line-intake-e2e.test.ts
npx tsx --test tests/line-bot.test.ts
npx tsx --test tests/line-webhook.test.ts
npx tsx --test tests/admin-inbox-api.test.ts
npx tsx --test tests/line-intake-db.test.ts
npx tsx --test tests/validation.test.ts
npx tsx --test tests/request-security.test.ts
```

---

## 📂 Project Structure

```
├── app/
│   ├── admin/             # Admin workspace pages (/admin, /admin/login, /admin/setup)
│   ├── api/               # API route handlers (ticket intake, services, admin endpoints, LINE webhook)
│   ├── globals.css        # Global CSS, typography and Tailwind setup
│   ├── layout.tsx         # Root layout with pixel font configurations
│   └── page.tsx           # Server entry point for public storefront
├── components/
│   ├── admin/             # Admin dashboard components (Sidebar, JobForm, LineInbox, ServiceEditor)
│   ├── motion/            # Motion components (BiosBootScreen, TiltCard, AntiInspectTrap, SmoothPageScroll)
│   ├── HeroSection.tsx    # Storefront hero & arcade attract mode
│   ├── LandingPage.tsx    # Storefront page composer
│   ├── NavbarHud.tsx      # Retro HUD navbar with sound & visual toggles
│   ├── RepairTicketTerminal.tsx # Public job intake terminal
│   ├── RigBuilder.tsx     # Custom PC configuration simulator
│   └── ServiceCatalog.tsx # Live service list and category viewer
├── docs/                  # Architecture documentation and guides
├── lib/
│   ├── backend/           # Server-only database, auth, validation, and security utilities
│   ├── line/              # LINE Webhook handling, signature checks, and payload schemas
│   ├── config.ts          # Public shop config and social coordinates
│   └── sound.ts           # Web Audio API 8-bit synthesizer engine
├── public/                # Static sound effects, icons, and assets
├── scripts/               # Administrative scripts (owner provisioning, migrations)
└── tests/                 # Unit, integration, and security test suites
```

---

## 📜 License

Private repository. All rights reserved © 2026 8-Bit Computer Workshop.