# Design Specification: Web Admin Direct Reply to LINE Customers

- **Date:** 2026-09-10
- **Project:** 8bit
- **Status:** Approved by User
- **Author:** Antigravity (AI Assistant) & Shop Owner

---

## 1. Overview & Problem Statement
Currently, the shop owner can view incoming LINE customer messages and bot triage results inside `/admin` under the "แชตลูกค้า LINE" (`LineInbox`) tab. However, all outgoing manual replies to customers must be sent externally via the LINE Official Account Manager (mobile app or `manager.line.biz`).

This feature enables the shop owner to type and send text replies directly from the `/admin` web interface, seamlessly delivering them to the customer's LINE chat via LINE Messaging API (Push Message), persisting the conversation history, and handing off the conversation from the automated bot to the human technician.

---

## 2. Scope & Key Requirements

1. **Text Reply Capability:**
   - The shop owner can type text replies and send them directly from the web chat interface.
   - Character limit: up to 5,000 characters per message (per LINE Messaging API constraint).
   - Enter key submits the message; Shift + Enter enters a newline.
2. **LINE Push Message Integration:**
   - Outbound messages are delivered to the recipient via `https://api.line.me/v2/bot/message/push` using `LINE_CHANNEL_ACCESS_TOKEN`.
   - The recipient is identified by their unique `line_user_id` stored in `line_conversations`.
3. **Database Persistence & Sender Identification:**
   - Add a `sender` column to `public.line_messages` (`'customer' | 'shop'`, default `'customer'`).
   - All outgoing shop replies are persisted with `sender = 'shop'`, timestamp, and room UUID.
4. **Auto Handoff from Bot to Human:**
   - When the shop owner sends a reply, if the conversation is currently in an intake triage state (`new`, `awaiting_device`, `awaiting_service`, `awaiting_issue`), its `intake_status` is automatically updated to `'completed'` to silence bot auto-replies.
5. **Chat Thread UI & Visual Hierarchy:**
   - Customer messages: left-aligned, dark slate bubble (`#1e293b`).
   - Shop owner messages: right-aligned, retro 8-bit emerald bubble (`#064e3b` with `#34d399` border).
   - Immediate thread update and auto-scroll to the bottom upon sending.
6. **Error Handling & Resilience:**
   - If sending fails (network, token, quota, blocked), display clear Thai feedback.
   - Retain input text in the compose box on failure so the user does not have to retype.
   - Require authenticated owner session for all reply requests.

---

## 3. Architecture & Data Flow

```
[Owner types in Web Admin]
            ↓ (Enter / Click Send)
[POST /api/admin/inbox/reply]
            ↓ (Validate session & payload)
[LINE Push API: api.line.me/v2/bot/message/push]
            ↓
  ┌─────────┴─────────┐
  │ Success?          │
  ▼                   ▼
(Yes)                (No)
  ↓                   ↓
- Insert message     Return HTTP error
  (sender: 'shop')   (Keep text in input)
- Update last_message_at
- Set intake_status = 'completed'
- Return 200 JSON
  ↓
[Update UI Thread & Clear Input]
```

---

## 4. Detailed Component Design

### 4.1 Database Migration (`supabase/migrations/20260910100000_line_admin_reply.sql`)

```sql
-- 1. Add sender column to line_messages
ALTER TABLE public.line_messages
ADD COLUMN IF NOT EXISTS sender text NOT NULL DEFAULT 'customer'
  CHECK (sender IN ('customer', 'shop'));

-- 2. Index for sender/conversation filtering if needed
CREATE INDEX IF NOT EXISTS line_messages_sender_idx
ON public.line_messages(conversation_id, sender);
```

### 4.2 TypeScript Types (`lib/line/types.ts`)

Update `ChatMessage` type to include `sender`:

```typescript
export interface ChatMessage {
  id: number;
  conversation_id: string;
  line_message_id: string | null;
  kind: string;
  text: string;
  metadata: Record<string, unknown>;
  unsent: boolean;
  sender: 'customer' | 'shop';
  sent_at: string;
  received_at: string;
}
```

### 4.3 LINE Push Helper (`lib/line/bot.ts`)

Export a dedicated push message function:

```typescript
export async function sendLinePushMessage(lineUserId: string, text: string): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim();
  if (!token) return { ok: false, error: 'LINE_CHANNEL_ACCESS_TOKEN is missing' };

  try {
    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: lineUserId,
        messages: [{ type: 'text', text }],
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { ok: false, error: body.message || `LINE API error ${res.status}` };
    }
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}
```

### 4.4 Admin Reply API (`app/api/admin/inbox/reply/route.ts`)

- **Method:** `POST`
- **Auth:** `requireOwner(request)`
- **Body:** `{ roomId: string; text: string }`
- **Logic:**
  1. Validate `roomId` and `text` (trimmed length 1..5000).
  2. Fetch conversation from Supabase (`line_conversations`).
  3. Call `sendLinePushMessage(conversation.line_user_id, text)`.
  4. If LINE fails, return `400` or `502` with descriptive error message.
  5. If LINE succeeds, insert into `line_messages`:
     - `conversation_id: roomId`
     - `kind: 'text'`
     - `text: text`
     - `sender: 'shop'`
     - `sent_at: new Date().toISOString()`
  6. Update `line_conversations`:
     - `last_message_at: new Date().toISOString()`
     - If `intake_status !== 'completed'`, set `intake_status = 'completed'`.
  7. Return `{ success: true, message: insertedMessage }`.

### 4.5 Admin UI (`components/admin/LineInbox.tsx` & `admin.css`)

- Replace `.line-compose-note` with an active `.line-compose-form`:
  - Multiline or single-line textarea with auto-submit on Enter (unless Shift is pressed).
  - Submit button with loading state (`กำลังส่ง…`).
  - Small helper note: `"ตอบกลับผ่าน LINE Push API • นับในโควตารายเดือนของ LINE OA"`.
- Style chat bubbles:
  - Default / `customer`: left-aligned, slate gray background (`#1e293b`).
  - `shop`: right-aligned, dark emerald background (`#064e3b`), cyan/green border (`#34d399`), distinct timestamp color.
- Immediate thread append and scroll down on successful reply.

---

## 5. Edge Cases & Handling

| Scenario | Behavior |
| :--- | :--- |
| Empty / whitespace input | Submit disabled; nothing sent |
| Message > 5000 chars | Prevent submission; alert owner |
| Network / LINE API down | Show error banner; keep typed text in input box |
| Missing LINE token | Return descriptive error: `"LINE Channel Access Token ยังไม่พร้อมใช้งาน"` |
| Customer blocked LINE OA | Return friendly error: `"ไม่สามารถส่งข้อความได้ ลูกค้าอาจบล็อก LINE OA"` |
| Active bot intake in progress | Reply automatically changes `intake_status` to `'completed'`, silencing future bot prompts |

---

## 6. Verification Plan

1. **Unit & API Tests:**
   - Unauthenticated access returns `401`.
   - Empty text or invalid roomId returns `400`.
   - Mocked LINE push success inserts `sender = 'shop'` and marks intake `'completed'`.
   - Mocked LINE push failure returns error and does not insert fake message.
2. **UI & Build Verification:**
   - `npm run build` passes with zero type errors.
   - Enter sends, Shift+Enter does newline.
   - Left/right bubble rendering verified for customer vs shop messages.
