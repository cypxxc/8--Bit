# LINE OA Intake Chatbot & Admin Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide an automated intake chatbot on LINE OA that collects device type, service category, and problem details from customers using Quick Replies, stores the intake state in Supabase, displays the collected info in Admin LineInbox, and allows one-click service job creation.

**Architecture:** A state-driven conversation engine inside the LINE webhook pipeline that transitions customer state (`awaiting_device` -> `awaiting_service` -> `awaiting_issue` -> `completed`), responds via LINE Messaging API (`/v2/bot/message/reply`) using Quick Reply buttons, persists state in `line_conversations`, and surfaces completed intakes in the Admin LineInbox with an Intake Summary card and prefilled `JobForm` modal.

**Tech Stack:** Next.js (App Router, TypeScript, React 19), Supabase (PostgreSQL, RPCs), LINE Messaging API (Reply API, Quick Reply), Node.js test runner (`node:test`, `tsx`).

## Global Constraints
- Device types are strictly `'PC'` and `'Notebook'`.
- Services strictly match approved shop catalog (Windows/Software setup, Hardware upgrades, Cleaning/Maintenance).
- Dark navy, cyan, and green 8-bit retro theme.
- Thai language copy for customer and administrative interactions.
- All webhook inputs verified via HMAC-SHA256 signature (`x-line-signature`).
- No fake reviews, demo prices, or repair claims outside approved catalog.

---

### Task 1: Database Migration for Conversation Intake State

**Files:**
- Create: `supabase/migrations/20260909090000_line_bot_intake.sql`
- Test: `tests/line-intake-db.test.ts`

**Interfaces:**
- Consumes: Existing `line_conversations` table and `shop_receive_line` RPC.
- Produces: Columns `intake_status text` ('new', 'awaiting_device', 'awaiting_service', 'awaiting_issue', 'completed') and `intake_data jsonb` on `line_conversations`; RPC `shop_update_line_intake(p_room uuid, p_status text, p_data jsonb)`.

- [ ] **Step 1: Write the failing database migration test**

```typescript
// tests/line-intake-db.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('migration script adds intake_status and intake_data columns with valid constraints', () => {
  const sql = readFileSync('supabase/migrations/20260909090000_line_bot_intake.sql', 'utf8');
  assert.match(sql, /intake_status/);
  assert.match(sql, /intake_data/);
  assert.match(sql, /awaiting_device/);
  assert.match(sql, /awaiting_service/);
  assert.match(sql, /awaiting_issue/);
  assert.match(sql, /completed/);
  assert.match(sql, /shop_update_line_intake/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/line-intake-db.test.ts`
Expected: FAIL (file not found)

- [ ] **Step 3: Write the SQL migration file**

```sql
-- supabase/migrations/20260909090000_line_bot_intake.sql
-- Add intake fields to line_conversations
ALTER TABLE public.line_conversations
ADD COLUMN IF NOT EXISTS intake_status text NOT NULL DEFAULT 'new'
  CHECK (intake_status IN ('new', 'awaiting_device', 'awaiting_service', 'awaiting_issue', 'completed')),
ADD COLUMN IF NOT EXISTS intake_data jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Index for filtering completed or active intakes in admin inbox
CREATE INDEX IF NOT EXISTS idx_line_conversations_intake ON public.line_conversations(intake_status);

-- Function to update intake state and data safely
CREATE OR REPLACE FUNCTION public.shop_update_line_intake(
  p_room uuid,
  p_status text,
  p_data jsonb
) RETURNS void
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  UPDATE public.line_conversations
  SET intake_status = p_status,
      intake_data = COALESCE(p_data, '{}'::jsonb)
  WHERE id = p_room;
END;
$$;

REVOKE ALL ON FUNCTION public.shop_update_line_intake(uuid, text, jsonb) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.shop_update_line_intake(uuid, text, jsonb) TO service_role;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/line-intake-db.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260909090000_line_bot_intake.sql tests/line-intake-db.test.ts
git commit -m "feat(db): add intake_status and intake_data migration for line conversations"
```

---

### Task 2: Core Bot State Machine & Quick Reply Logic

**Files:**
- Create: `lib/line/bot.ts`
- Test: `tests/line-bot.test.ts`

**Interfaces:**
- Consumes: Standard LINE webhook event text & kind.
- Produces:
  - Types: `IntakeStatus`, `IntakeData`, `BotTransitionResult`
  - Functions: `evaluateBotTransition(status: IntakeStatus, data: IntakeData, text: string, kind?: string): BotTransitionResult`
  - Functions: `buildLineReplyPayload(transition: BotTransitionResult): { type: string; text: string; quickReply?: { items: any[] } }[]`

- [ ] **Step 1: Write the failing unit tests for bot state machine**

```typescript
// tests/line-bot.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateBotTransition,
  buildLineReplyPayload,
  type IntakeStatus,
  type IntakeData,
} from '../lib/line/bot';

test('new or unknown state transitions to awaiting_device with device quick replies', () => {
  const result = evaluateBotTransition('new', {}, 'สวัสดีครับ');
  assert.equal(result.nextStatus, 'awaiting_device');
  const payload = buildLineReplyPayload(result);
  assert.equal(payload.length, 1);
  assert.match(payload[0].text, /ยินดีต้อนรับ|8bit/);
  assert.equal(payload[0].quickReply?.items.length, 2);
  assert.equal(payload[0].quickReply?.items[0].action.text, 'คอมพิวเตอร์ตั้งโต๊ะ (PC)');
  assert.equal(payload[0].quickReply?.items[1].action.text, 'โน้ตบุ๊ก (Notebook)');
});

test('awaiting_device accepts PC and transitions to awaiting_service with service quick replies', () => {
  const result = evaluateBotTransition('awaiting_device', {}, 'คอมพิวเตอร์ตั้งโต๊ะ (PC)');
  assert.equal(result.nextStatus, 'awaiting_service');
  assert.equal(result.nextData.device_type, 'PC');
  const payload = buildLineReplyPayload(result);
  assert.equal(payload[0].quickReply?.items.length, 4);
});

test('awaiting_device accepts Notebook and transitions to awaiting_service', () => {
  const result = evaluateBotTransition('awaiting_device', {}, 'Notebook');
  assert.equal(result.nextStatus, 'awaiting_service');
  assert.equal(result.nextData.device_type, 'Notebook');
});

test('awaiting_service accepts selected service and transitions to awaiting_issue', () => {
  const prevData: IntakeData = { device_type: 'PC' };
  const result = evaluateBotTransition('awaiting_service', prevData, '🪟 ลง Windows / โปรแกรม');
  assert.equal(result.nextStatus, 'awaiting_issue');
  assert.equal(result.nextData.service_category, 'ลง Windows / โปรแกรม');
  const payload = buildLineReplyPayload(result);
  assert.match(payload[0].text, /เล่าอาการ|ปัญหา/);
});

test('awaiting_issue accepts user message and transitions to completed', () => {
  const prevData: IntakeData = { device_type: 'PC', service_category: 'ลง Windows / โปรแกรม' };
  const result = evaluateBotTransition('awaiting_issue', prevData, 'เครื่องค้างบ่อย บูตไม่ขึ้น');
  assert.equal(result.nextStatus, 'completed');
  assert.equal(result.nextData.issue_description, 'เครื่องค้างบ่อย บูตไม่ขึ้น');
  assert.ok(result.nextData.completed_at);
  const payload = buildLineReplyPayload(result);
  assert.match(payload[0].text, /บันทึกข้อมูลเรียบร้อย/);
});

test('keyword "เริ่มใหม่" or "reset" resets flow to awaiting_device from any state', () => {
  const prevData: IntakeData = { device_type: 'PC', service_category: 'ลง Windows / โปรแกรม' };
  const result = evaluateBotTransition('completed', prevData, 'เริ่มใหม่');
  assert.equal(result.nextStatus, 'awaiting_device');
  assert.deepEqual(result.nextData, {});
});

test('completed state ignores subsequent normal messages', () => {
  const prevData: IntakeData = { device_type: 'PC', completed_at: '2026-09-09T00:00:00Z' };
  const result = evaluateBotTransition('completed', prevData, 'ช่างอยู่ไหมครับ');
  assert.equal(result.nextStatus, 'completed');
  assert.equal(result.replyText, null);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/line-bot.test.ts`
Expected: FAIL (module `lib/line/bot` not found)

- [ ] **Step 3: Implement `lib/line/bot.ts`**

```typescript
// lib/line/bot.ts
export type IntakeStatus = 'new' | 'awaiting_device' | 'awaiting_service' | 'awaiting_issue' | 'completed';

export interface IntakeData {
  device_type?: 'PC' | 'Notebook';
  service_category?: string;
  issue_description?: string;
  completed_at?: string;
}

export interface BotTransitionResult {
  nextStatus: IntakeStatus;
  nextData: IntakeData;
  replyText: string | null;
  quickReplyOptions?: { label: string; text: string }[];
}

export const DEVICE_OPTIONS = [
  { label: '🖥️ คอมตั้งโต๊ะ (PC)', text: 'คอมพิวเตอร์ตั้งโต๊ะ (PC)', value: 'PC' as const },
  { label: '💻 โน้ตบุ๊ก (Notebook)', text: 'โน้ตบุ๊ก (Notebook)', value: 'Notebook' as const },
];

export const SERVICE_OPTIONS = [
  { label: '🪟 ลง Windows / โปรแกรม', text: '🪟 ลง Windows / โปรแกรม', value: 'ลง Windows / โปรแกรม' },
  { label: '⚡ อัปเกรดเครื่อง (RAM/SSD)', text: '⚡ อัปเกรดเครื่อง (RAM/SSD)', value: 'อัปเกรดเครื่อง (RAM/SSD)' },
  { label: '🧹 ตรวจเช็ก / ทำความสะอาด', text: '🧹 ตรวจเช็ก / ทำความสะอาด', value: 'ตรวจเช็ก / ทำความสะอาด' },
  { label: '💬 ปรึกษาอาการทั่วไป', text: '💬 ปรึกษาอาการทั่วไป', value: 'ปรึกษาอาการทั่วไป' },
];

export function evaluateBotTransition(
  status: IntakeStatus,
  data: IntakeData,
  text: string,
  kind: string = 'text'
): BotTransitionResult {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // Reset trigger
  if (lower === 'เริ่มใหม่' || lower === 'reset' || lower === '/reset') {
    return {
      nextStatus: 'awaiting_device',
      nextData: {},
      replyText: '🕹️ 8bit Shop Assistant ยินดีต้อนรับครับ!\nเพื่อความรวดเร็ว กรุณาเลือกประเภทอุปกรณ์ของคุณ:',
      quickReplyOptions: DEVICE_OPTIONS.map(o => ({ label: o.label, text: o.text })),
    };
  }

  // Already completed - do not interrupt human conversation
  if (status === 'completed') {
    return {
      nextStatus: 'completed',
      nextData: data,
      replyText: null,
    };
  }

  // New or awaiting_device
  if (status === 'new' || status === 'awaiting_device') {
    const isPc = /คอม|pc|ตั้งโต๊ะ/i.test(trimmed);
    const isNb = /โน้ต|notebook|laptop/i.test(trimmed);

    if (isPc || isNb) {
      const device_type = isPc ? 'PC' : 'Notebook';
      return {
        nextStatus: 'awaiting_service',
        nextData: { ...data, device_type },
        replyText: `รับทราบครับ (${device_type}) 🔧\nกรุณาเลือกบริการที่ต้องการ:`,
        quickReplyOptions: SERVICE_OPTIONS.map(o => ({ label: o.label, text: o.text })),
      };
    }

    // Default prompt to choose device
    return {
      nextStatus: 'awaiting_device',
      nextData: data,
      replyText: '🕹️ สวัสดีครับ ยินดีต้อนรับสู่ 8bit!\nเพื่อความสะดวกรวดเร็ว ช่างขอข้อมูลเบื้องต้นสักนิดนะครับ\nกรุณาเลือกประเภทอุปกรณ์ของคุณ:',
      quickReplyOptions: DEVICE_OPTIONS.map(o => ({ label: o.label, text: o.text })),
    };
  }

  // Awaiting service
  if (status === 'awaiting_service') {
    let matchedService = trimmed;
    const found = SERVICE_OPTIONS.find(s => s.text === trimmed || trimmed.includes(s.value));
    if (found) {
      matchedService = found.value;
    }

    return {
      nextStatus: 'awaiting_issue',
      nextData: { ...data, service_category: matchedService },
      replyText: `เลือกบริการ: ${matchedService} เรียบร้อยครับ 📋\n\nช่วยพิมพ์เล่าอาการ หรือปัญหาที่พบเพิ่มเติมสั้นๆ ให้หน่อยครับ (หรือถ่ายภาพ/คลิปอาการส่งมาได้เลยครับ)`,
    };
  }

  // Awaiting issue details
  if (status === 'awaiting_issue') {
    const issueText = kind === 'image' ? '[ลูกค้าแนบภาพอาการ]' : trimmed || 'ตรวจเช็กอาการทั่วไป';
    return {
      nextStatus: 'completed',
      nextData: {
        ...data,
        issue_description: issueText,
        completed_at: new Date().toISOString(),
      },
      replyText: '🎮 บันทึกข้อมูลเบื้องต้นเรียบร้อยแล้วครับ!\nช่างได้รับข้อมูลแล้ว และจะเข้ามาตรวจสอบพร้อมตอบกลับในแชตนี้สักครู่นะครับ ขอบคุณครับ 🙏',
    };
  }

  return {
    nextStatus: status,
    nextData: data,
    replyText: null,
  };
}

export function buildLineReplyPayload(transition: BotTransitionResult) {
  if (!transition.replyText) return [];

  const message: {
    type: 'text';
    text: string;
    quickReply?: { items: Array<{ type: 'action'; action: { type: 'message'; label: string; text: string } }> };
  } = {
    type: 'text',
    text: transition.replyText,
  };

  if (transition.quickReplyOptions && transition.quickReplyOptions.length > 0) {
    message.quickReply = {
      items: transition.quickReplyOptions.map(opt => ({
        type: 'action',
        action: {
          type: 'message',
          label: opt.label.slice(0, 20),
          text: opt.text.slice(0, 300),
        },
      })),
    };
  }

  return [message];
}

export async function sendLineReply(replyToken: string, messages: any[]): Promise<boolean> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim();
  if (!token || !replyToken || !messages.length) return false;

  try {
    const res = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        replyToken,
        messages,
      }),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch (err) {
    console.error('sendLineReply error:', err);
    return false;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/line-bot.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/line/bot.ts tests/line-bot.test.ts
git commit -m "feat(bot): add state-driven intake transition engine and quick reply generator"
```

---

### Task 3: Webhook Normalization & Automated Reply Dispatcher

**Files:**
- Modify: `lib/line/webhook.ts`
- Modify: `app/api/line/webhook/route.ts`
- Test: `tests/line-webhook.test.ts`

**Interfaces:**
- Consumes: LINE Webhook request with `replyToken`.
- Produces: `IncomingLineEvent` with `replyToken?: string`, calls `evaluateBotTransition` and `sendLineReply` when user interacts.

- [ ] **Step 1: Update `tests/line-webhook.test.ts` to expect `replyToken` preservation**

In `tests/line-webhook.test.ts`, ensure `replyToken` is parsed and available when provided in message/follow events.

```typescript
// Update tests/line-webhook.test.ts:
// In the normalization test:
test('customer identities remain separate; groups ignored; replyToken retained for message events', () => {
  assert.equal(normalizeEvent({ ...event, source: { type: 'group', groupId: 'g', userId: event.source.userId } }), null);
  const normalized = normalizeEvent({
    ...event,
    replyToken: 'test-reply-token-123',
    message: { ...event.message, unknown: 'not retained' },
  }) as IncomingLineEvent;
  assert.equal(normalized.userId, event.source.userId);
  assert.equal(normalized.replyToken, 'test-reply-token-123');
  assert.equal(JSON.stringify(normalized).includes('not retained'), false);
  assert.equal(normalizeEvent({ ...event, type: 'unsend', unsend: { messageId: '123' } })?.messageId, '123');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/line-webhook.test.ts`
Expected: FAIL (replyToken is undefined)

- [ ] **Step 3: Update `lib/line/webhook.ts` to include `replyToken`**

In `lib/line/webhook.ts`:
- Add `replyToken?: string` to `IncomingLineEvent`.
- In `normalizeEvent`: If `typeof event.replyToken === 'string'`, save `result.replyToken = str(event.replyToken, 100);`.

- [ ] **Step 4: Update `app/api/line/webhook/route.ts` to process bot transition**

In `app/api/line/webhook/route.ts`:
- After saving event via `shop_receive_line`, query the conversation's `intake_status` and `intake_data`.
- If event is of type `message` or `follow`, call `evaluateBotTransition(status, data, text, kind)`.
- If a reply text is generated and `replyToken` exists:
  - Call `sendLineReply(replyToken, payload)`.
  - Update `intake_status` and `intake_data` via Supabase `line_conversations`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx tsx --test tests/line-webhook.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add lib/line/webhook.ts app/api/line/webhook/route.ts tests/line-webhook.test.ts
git commit -m "feat(webhook): parse replyToken and dispatch automated bot intake replies"
```

---

### Task 4: Admin API: Fetch & Reset Conversation Intake State

**Files:**
- Modify: `lib/line/types.ts`
- Modify: `app/api/admin/inbox/route.ts`
- Create: `app/api/admin/inbox/intake/route.ts`
- Test: `tests/admin-inbox-api.test.ts`

**Interfaces:**
- Consumes: Admin session auth (`verifyAdmin`).
- Produces:
  - `Conversation` type with `intake_status: string; intake_data: Record<string, any>`.
  - `GET /api/admin/inbox` returns `intake_status` and `intake_data`.
  - `POST /api/admin/inbox/intake` resets intake status to `'awaiting_device'`.

- [ ] **Step 1: Write the failing API test**

```typescript
// tests/admin-inbox-api.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { messageLabel, customerName, type Conversation } from '../lib/line/types';

test('Conversation interface supports intake_status and intake_data', () => {
  const c: Conversation = {
    id: 'room-1',
    line_user_id: 'U12345678901234567890123456789012',
    display_name: 'Test Customer',
    picture_url: null,
    last_message_at: null,
    unread_count: 0,
    intake_status: 'completed',
    intake_data: { device_type: 'PC', service_category: 'ลง Windows / โปรแกรม' },
  };
  assert.equal(c.intake_status, 'completed');
  assert.equal(c.intake_data?.device_type, 'PC');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/admin-inbox-api.test.ts`
Expected: FAIL (Property 'intake_status' does not exist on type 'Conversation')

- [ ] **Step 3: Update `lib/line/types.ts`, `app/api/admin/inbox/route.ts`, and add `app/api/admin/inbox/intake/route.ts`**

1. In `lib/line/types.ts`:
   Add `intake_status?: string;` and `intake_data?: Record<string, any>;` to `Conversation`.
2. In `app/api/admin/inbox/route.ts`:
   Include `intake_status, intake_data` in `.select()`.
3. In `app/api/admin/inbox/intake/route.ts`:
   Add POST endpoint requiring admin auth that resets `intake_status` to `'awaiting_device'` and clears `intake_data`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/admin-inbox-api.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/line/types.ts app/api/admin/inbox/route.ts app/api/admin/inbox/intake/route.ts tests/admin-inbox-api.test.ts
git commit -m "feat(api): expose intake fields in inbox API and provide reset endpoint"
```

---

### Task 5: Admin UI: Intake Badges & Summary Card in LineInbox

**Files:**
- Modify: `components/admin/LineInbox.tsx`
- Modify: `app/admin/admin.css`

**Interfaces:**
- Consumes: `Conversation.intake_status`, `Conversation.intake_data`.
- Produces:
  - Badges in room list: `[🤖 ข้อมูลครบแล้ว]` (green retro style) vs `[กำลังคุยกับบอท]`.
  - Filter checkbox: "เฉพาะข้อมูลครบแล้ว".
  - Intake Summary Banner on top of selected chat thread.
  - Action buttons: `[ ➕ สร้างเป็นงานบริการ ]` and `[ 🔄 รีเซ็ตบอท ]`.

- [ ] **Step 1: Add intake badge and filter to `components/admin/LineInbox.tsx`**

In `components/admin/LineInbox.tsx`:
- Add filter state: `const [completedOnly, setCompletedOnly] = useState(false);`
- In the room list items:
  - If `c.intake_status === 'completed'`: Render `<span className="line-intake-badge completed">🤖 ข้อมูลครบ</span>`
  - If `c.intake_status?.startsWith('awaiting_')`: Render `<span className="line-intake-badge pending">บอทถามอยู่</span>`
- In the selected thread panel:
  - If `selected.intake_status === 'completed' && selected.intake_data`:
    Render the Retro Intake Card showing:
    - อุปกรณ์: `selected.intake_data.device_type`
    - บริการ: `selected.intake_data.service_category`
    - รายละเอียด: `selected.intake_data.issue_description`
    - Button `[ ➕ สร้างเป็นงานบริการ ]`
    - Button `[ 🔄 รีเซ็ตบอท ]`

- [ ] **Step 2: Add styles for intake badges and card in `app/admin/admin.css`**

Ensure styling conforms to dark navy, neon cyan (`#00f0ff`), and 8-bit green (`#39ff14`).

- [ ] **Step 3: Run build and lint to verify no compilation errors**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add components/admin/LineInbox.tsx app/admin/admin.css
git commit -m "feat(ui): display intake status badges and summary card in LineInbox"
```

---

### Task 6: One-Click Prefill from LineInbox into `JobForm`

**Files:**
- Modify: `components/admin/JobForm.tsx`
- Modify: `components/admin/AdminApp.tsx`
- Modify: `components/admin/LineInbox.tsx`

**Interfaces:**
- Consumes: Callback `onCreateJob(prefill: Partial<Job>)` from `LineInbox` passed to `AdminApp`.
- Produces: Opens `JobForm` with customer name, device type, service, and description prefilled.

- [ ] **Step 1: Support `initialData` in `JobForm.tsx`**

Update `JobForm`:
- Accept optional `initialData?: Partial<Job>`.
- In the form inputs for "เพิ่มงานหน้าร้าน":
  - `customer_name` default to `initialData?.customer_name || ''`
  - `device_type` default to `initialData?.device_type || 'PC'`
  - `description` default to `initialData?.description || ''`
  - `line_id` default to `initialData?.line_id || ''`

- [ ] **Step 2: Wire up `onCreateJob` in `AdminApp.tsx` and `LineInbox.tsx`**

- In `AdminApp.tsx`:
  - Provide a handler `handleCreateJobFromIntake(initial: Partial<Job>)` that sets `editing: null` (or a special state) with `initialData` prefilled, switching to or opening the Job modal.
- In `LineInbox.tsx`:
  - When user clicks `[ ➕ สร้างเป็นงานบริการ ]`, call `onCreateJob` with `{ customer_name: selected.display_name, device_type: selected.intake_data.device_type, description: selected.intake_data.issue_description, line_id: selected.line_user_id }`.

- [ ] **Step 3: Run Next.js build to verify complete system integrity**

Run: `npm run build`
Expected: Build succeeds with zero errors.

- [ ] **Step 4: Commit**

```bash
git add components/admin/JobForm.tsx components/admin/AdminApp.tsx components/admin/LineInbox.tsx
git commit -m "feat(workflow): enable one-click service job creation from LINE intake"
```

---

### Task 7: Full End-to-End Verification & Documentation

**Files:**
- Test: `tests/line-intake-e2e.test.ts`
- Modify: `README.md` (document LINE bot intake flow)

**Interfaces:**
- Verify complete conversation sequence from first greeting through job creation.

- [ ] **Step 1: Write end-to-end simulation test**

Create `tests/line-intake-e2e.test.ts` simulating the entire flow:
1. Customer says "สวัสดี" -> Bot replies with device Quick Reply options.
2. Customer taps "PC" -> Bot replies with service Quick Reply options.
3. Customer taps "ลง Windows" -> Bot asks for problem description.
4. Customer sends "เปิดติดแต่จอดำ" -> Bot replies confirmation, status becomes `completed`.
5. Verify prefill structure matches `JobForm` requirements.

- [ ] **Step 2: Run all test suites**

Run: `npx tsx --test tests/line-bot.test.ts tests/line-webhook.test.ts tests/admin-inbox-api.test.ts tests/line-intake-e2e.test.ts`
Expected: All tests PASS.

- [ ] **Step 3: Run linter and build**

Run: `npm run lint; npm run build`
Expected: Clean build with no errors.

- [ ] **Step 4: Commit**

```bash
git add tests/line-intake-e2e.test.ts README.md
git commit -m "test: add end-to-end simulation test for LINE bot intake"
```
