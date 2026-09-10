# LINE Web Admin Direct Reply Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow the shop owner to type and send text replies directly to LINE customers from the `/admin` web interface, delivering messages via the LINE Messaging API, persisting conversation history, and handing off conversations from the intake bot to the human technician.

**Architecture:** Add a `sender` column to the `line_messages` table to differentiate customer and shop messages. Provide a LINE push messaging helper in `lib/line/bot.ts`. Create a protected `POST /api/admin/inbox/reply` route that verifies owner authentication, calls LINE's Push Message API, persists the outgoing message with `sender = 'shop'`, and transitions the intake status to `'completed'`. Update `components/admin/LineInbox.tsx` and `app/admin/admin.css` with a retro 8-bit compose bar and right-aligned shop bubbles.

**Tech Stack:** Next.js (App Router), TypeScript, Supabase PostgreSQL, LINE Messaging API (Push Message), Node.js test runner (`tsx`).

## Global Constraints

- Preserve approved shop content and rules from `AGENTS.md` and `PRODUCT.md`.
- Strictly require owner authentication for the reply endpoint via `requireOwner(request)`.
- Never send test messages to real customer accounts on LINE.
- Character limit for replies: maximum 5,000 characters (LINE API constraint).
- Graceful error handling: never clear the compose text input if delivery fails.

---

### Task 1: Database Migration for Message Sender and Type Definitions

**Files:**
- Create: `supabase/migrations/20260910100000_line_admin_reply.sql`
- Modify: `lib/line/types.ts:1-40`
- Test: `tests/line-types.test.ts`

**Interfaces:**
- Consumes: Existing `ChatMessage` and `Conversation` types in `lib/line/types.ts`.
- Produces: Updated `ChatMessage` type with `sender: 'customer' | 'shop'` field.

- [ ] **Step 1: Write failing test for message type schema**

Create `tests/line-types.test.ts`:
```typescript
import test from 'node:test';
import assert from 'node:assert/strict';
import type { ChatMessage } from '../lib/line/types';

test('ChatMessage includes sender field', () => {
  const msg: ChatMessage = {
    id: 1,
    conversation_id: '123e4567-e89b-12d3-a456-426614174000',
    line_message_id: 'msg-1',
    event_id: 'evt-1',
    kind: 'text',
    text: 'สวัสดีครับ',
    metadata: {},
    unsent: false,
    sender: 'shop',
    sent_at: '2026-09-10T08:00:00.000Z',
    received_at: '2026-09-10T08:00:01.000Z',
  };
  assert.equal(msg.sender, 'shop');
});
```

- [ ] **Step 2: Run test to make sure it fails**

Run: `npx tsx tests/line-types.test.ts` (fails because `sender` is not yet on `ChatMessage`).

- [ ] **Step 3: Update `lib/line/types.ts` and create SQL migration**

In `lib/line/types.ts`, add `sender: 'customer' | 'shop'` to `ChatMessage`:
```typescript
export interface ChatMessage {
  id: number;
  conversation_id: string;
  line_message_id: string | null;
  event_id?: string | null;
  kind: string;
  text: string;
  metadata: Record<string, unknown>;
  unsent: boolean;
  sender: 'customer' | 'shop';
  sent_at: string;
  received_at: string;
}
```

In `supabase/migrations/20260910100000_line_admin_reply.sql`:
```sql
ALTER TABLE public.line_messages
ADD COLUMN IF NOT EXISTS sender text NOT NULL DEFAULT 'customer'
  CHECK (sender IN ('customer', 'shop'));

CREATE INDEX IF NOT EXISTS line_messages_sender_idx
ON public.line_messages(conversation_id, sender);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx tests/line-types.test.ts`.

- [ ] **Step 5: Commit changes**

`git add supabase/migrations/20260910100000_line_admin_reply.sql lib/line/types.ts tests/line-types.test.ts`
`git commit -m "feat(db): add sender column to line_messages and update ChatMessage type"`

---

### Task 2: LINE Push Message Delivery Function

**Files:**
- Modify: `lib/line/bot.ts:150-179`
- Test: `tests/line-push.test.ts`

**Interfaces:**
- Consumes: `process.env.LINE_CHANNEL_ACCESS_TOKEN`.
- Produces: `sendLinePushMessage(lineUserId: string, text: string): Promise<{ ok: boolean; error?: string }>`.

- [ ] **Step 1: Write failing test for `sendLinePushMessage`**

Create `tests/line-push.test.ts`:
```typescript
import test from 'node:test';
import assert from 'node:assert/strict';
import { sendLinePushMessage } from '../lib/line/bot';

test('sendLinePushMessage returns error when token is missing', async () => {
  const orig = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  delete process.env.LINE_CHANNEL_ACCESS_TOKEN;
  try {
    const result = await sendLinePushMessage('U1234567890', 'สวัสดีครับ');
    assert.equal(result.ok, false);
    assert.match(result.error!, /LINE_CHANNEL_ACCESS_TOKEN/);
  } finally {
    process.env.LINE_CHANNEL_ACCESS_TOKEN = orig;
  }
});

test('sendLinePushMessage sends push message with correct payload', async () => {
  const origToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  process.env.LINE_CHANNEL_ACCESS_TOKEN = 'test-token';
  const origFetch = global.fetch;

  let capturedUrl = '';
  let capturedBody: any = null;
  let capturedAuth = '';

  global.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    capturedUrl = String(url);
    capturedBody = JSON.parse(String(init?.body || '{}'));
    capturedAuth = String(init?.headers && (init.headers as any)['Authorization']);
    return new Response(JSON.stringify({}), { status: 200 });
  }) as any;

  try {
    const result = await sendLinePushMessage('Utestuser', 'ทดสอบส่งข้อความ');
    assert.equal(result.ok, true);
    assert.equal(capturedUrl, 'https://api.line.me/v2/bot/message/push');
    assert.equal(capturedAuth, 'Bearer test-token');
    assert.equal(capturedBody.to, 'Utestuser');
    assert.deepEqual(capturedBody.messages, [{ type: 'text', text: 'ทดสอบส่งข้อความ' }]);
  } finally {
    process.env.LINE_CHANNEL_ACCESS_TOKEN = origToken;
    global.fetch = origFetch;
  }
});
```

- [ ] **Step 2: Run test to make sure it fails**

Run: `npx tsx tests/line-push.test.ts` (fails because `sendLinePushMessage` does not exist yet).

- [ ] **Step 3: Implement `sendLinePushMessage` in `lib/line/bot.ts`**

Add to `lib/line/bot.ts`:
```typescript
export async function sendLinePushMessage(
  lineUserId: string,
  text: string
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim();
  if (!token) return { ok: false, error: 'LINE_CHANNEL_ACCESS_TOKEN is missing or empty' };
  if (!lineUserId?.trim() || !text?.trim()) return { ok: false, error: 'Invalid recipient or empty text' };

  try {
    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: lineUserId.trim(),
        messages: [{ type: 'text', text: text.trim() }],
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({} as Record<string, unknown>));
      const message = (body as { message?: string }).message || `LINE API error ${res.status}`;
      return { ok: false, error: message };
    }
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx tests/line-push.test.ts`.

- [ ] **Step 5: Commit changes**

`git add lib/line/bot.ts tests/line-push.test.ts`
`git commit -m "feat(line): implement sendLinePushMessage helper"`

---

### Task 3: Protected Admin Reply API Route

**Files:**
- Create: `app/api/admin/inbox/reply/route.ts`
- Test: `tests/line-reply-route.test.ts`

**Interfaces:**
- Consumes: `requireOwner(request)` from `lib/backend/auth.ts`, `sendLinePushMessage` from `lib/line/bot.ts`, and Supabase client from `lib/backend/supabase.ts`.
- Produces: `POST /api/admin/inbox/reply` route accepting `{ roomId: string; text: string }`.

- [ ] **Step 1: Write failing test for reply API route handler**

Create `tests/line-reply-route.test.ts`:
Test input validation (missing roomId, empty text, text > 5000 chars) and ensure proper error responses.

- [ ] **Step 2: Run test to make sure it fails**

Run: `npx tsx tests/line-reply-route.test.ts`.

- [ ] **Step 3: Implement `app/api/admin/inbox/reply/route.ts`**

Implement route with:
- Authentication check: `const owner = await requireOwner(request); if (!owner) return Response.json({ error: 'Unauthorized' }, { status: 401 });`
- Parse `{ roomId, text } = await request.json()`.
- Validate `roomId` format and `text` (length 1..5000).
- Query `line_conversations` for `line_user_id` by `id = roomId`.
- Call `sendLinePushMessage(conversation.line_user_id, text)`.
- If push fails, return `{ error: result.error || 'ส่งข้อความไม่สำเร็จ' }` with status 400.
- If push succeeds:
  - Insert into `line_messages`:
    `{ conversation_id: roomId, kind: 'text', text: text.trim(), sender: 'shop', sent_at: new Date().toISOString() }`
  - Update `line_conversations`:
    `last_message_at = now`, `intake_status = 'completed'`
  - Return `{ success: true, message: insertedMessage }`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx tests/line-reply-route.test.ts`.

- [ ] **Step 5: Commit changes**

`git add app/api/admin/inbox/reply/route.ts tests/line-reply-route.test.ts`
`git commit -m "feat(api): add protected /api/admin/inbox/reply endpoint"`

---

### Task 4: Admin Chat UI & Retro 8-bit Styling

**Files:**
- Modify: `components/admin/LineInbox.tsx:170-199`
- Modify: `app/admin/admin.css:870-930`

**Interfaces:**
- Consumes: `POST /api/admin/inbox/reply` endpoint, `ChatMessage.sender`.
- Produces: Interactive compose bar with submit button and keyboard support (Enter), left-aligned customer bubbles, right-aligned shop bubbles.

- [ ] **Step 1: Update `LineInbox.tsx` with compose form state & handler**

In `components/admin/LineInbox.tsx`:
- Add state: `replyText`, `sendingReply`, `replyError`.
- Add `handleSendReply(e: FormEvent)`:
  - Validate `replyText.trim()`.
  - Set `sendingReply(true)`.
  - Call `await api('/api/admin/inbox/reply', 'POST', { roomId: currentRoom.id, text: replyText })`.
  - Optimistically append message to `thread.messages` and scroll to bottom.
  - Reset `replyText` to empty string.
  - Handle errors: display error message without clearing `replyText`.
- Support `onKeyDown` on textarea/input: if `Enter` without `Shift`, call `handleSendReply`.
- Update rendering of `.line-bubble`:
  - Add class `is-shop` if `m.sender === 'shop'`.
  - Show a small badge `[ช่าง/ร้าน]` for shop messages.

- [ ] **Step 2: Update `app/admin/admin.css` with compose form and chat bubble styles**

Add styles in `app/admin/admin.css`:
```css
/* Shop vs Customer message alignment */
.line-bubble.is-shop {
  margin-left: auto;
  margin-right: 0;
  background: #064e3b;
  border-color: #34d399;
  box-shadow: 2px 2px 0 #000, 0 0 8px rgba(52, 211, 153, 0.15);
}

.line-bubble.is-shop strong.line-sender-tag {
  font-family: var(--font-press-start), monospace;
  font-size: 8px;
  color: #39ff14;
  margin-bottom: 4px;
  display: block;
}

/* Compose bar */
.line-compose-form {
  padding: 14px 20px;
  background: #0c1322;
  border-top: 3px solid #1e293b;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.line-compose-input-row {
  display: flex;
  gap: 10px;
}

.line-compose-input {
  flex: 1;
  background: #05080e;
  border: 2px solid #1e293b;
  color: #f1f5f9;
  padding: 10px 14px;
  font-size: 14px;
  outline: none;
  font-family: inherit;
}

.line-compose-input:focus {
  border-color: #38bdf8;
}

.line-compose-submit-btn {
  background: #064e3b;
  color: #39ff14;
  border: 2px solid #39ff14;
  font-family: var(--font-press-start), monospace;
  font-size: 10px;
  padding: 0 16px;
  cursor: pointer;
}

.line-compose-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.line-compose-hint {
  font-size: 11px;
  color: #64748b;
  margin: 0;
}
```

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit`.

- [ ] **Step 4: Commit UI changes**

`git add components/admin/LineInbox.tsx app/admin/admin.css`
`git commit -m "feat(ui): add interactive LINE chat compose bar and shop message bubbles"`

---

### Task 5: End-to-End Simulation & Verification

**Files:**
- Create: `tests/line-reply-e2e.test.ts`
- Documentation: `README.md` or `docs/line-inbox-verification.md`

- [ ] **Step 1: Write end-to-end simulation test**

Create `tests/line-reply-e2e.test.ts` to simulate the complete cycle:
1. Customer initiates intake conversation.
2. Bot responds with device options.
3. Shop owner steps in and sends a reply message via `sendLinePushMessage`.
4. Verify conversation transitions to `'completed'`.
5. Verify messages list has customer message and shop message with distinct senders.

- [ ] **Step 2: Run test suite**

Run: `npx tsx tests/line-reply-e2e.test.ts`.
Run: `npx tsx tests/line-intake-e2e.test.ts`.

- [ ] **Step 3: Run full production build**

Run: `npm run build`.

- [ ] **Step 4: Commit and finalize**

`git add tests/line-reply-e2e.test.ts docs/line-inbox-verification.md`
`git commit -m "test: add end-to-end simulation test for LINE admin reply"`
