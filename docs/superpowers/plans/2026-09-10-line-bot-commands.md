# LINE OA Customer Chat Commands Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide customers in LINE OA with intuitive keyword commands and 1-tap Quick Reply buttons to reset triage data, re-select services, contact the human technician, and view the command menu.

**Architecture:** Extend `evaluateBotTransition` in `lib/line/bot.ts` to inspect incoming messages for command triggers (`ลบแชท`, `เริ่มใหม่`, `เลือกบริการใหม่`, `ติดต่อช่าง`, `เมนู`, etc.) before evaluating standard intake progression. Provide Quick Reply action buttons attached to command responses for 1-tap usage.

**Tech Stack:** Next.js, TypeScript, LINE Messaging API, Node.js test runner (`tsx`).

## Global Constraints

- Preserve approved shop content and rules from `AGENTS.md` and `PRODUCT.md`.
- Quick reply action labels must never exceed 20 characters (LINE spec).
- Ensure commands function even when conversation status is already `'completed'`.
- All tests must pass using `npx tsx <test-file>` with zero failures.

---

### Task 1: Bot Command Router Implementation and Unit Tests

**Files:**
- Modify: `lib/line/bot.ts:35-70`
- Create: `tests/line-commands.test.ts`

**Interfaces:**
- Consumes: `evaluateBotTransition(status, data, text, kind)`.
- Produces: Correct `BotTransitionResult` with new command responses and Quick Reply options.

- [ ] **Step 1: Write failing unit tests for new customer commands**

Create `tests/line-commands.test.ts`:
```typescript
import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateBotTransition } from '../lib/line/bot';

test('Command: ลบแชท / เริ่มใหม่ resets intake', () => {
  const res1 = evaluateBotTransition('completed', { device_type: 'PC' }, 'ลบแชท');
  assert.equal(res1.nextStatus, 'awaiting_device');
  assert.deepEqual(res1.nextData, {});
  assert.match(res1.replyText!, /รีเซ็ต/);
  assert.equal(res1.quickReplyOptions?.length, 2);

  const res2 = evaluateBotTransition('awaiting_issue', { device_type: 'Notebook' }, 'เริ่มใหม่');
  assert.equal(res2.nextStatus, 'awaiting_device');
  assert.deepEqual(res2.nextData, {});
});

test('Command: เลือกบริการใหม่ allows re-selecting service category', () => {
  // With known device
  const res1 = evaluateBotTransition('completed', { device_type: 'PC', service_category: 'ลง Windows' }, 'เลือกบริการใหม่');
  assert.equal(res1.nextStatus, 'awaiting_service');
  assert.equal(res1.nextData.device_type, 'PC');
  assert.equal(res1.nextData.service_category, undefined);
  assert.match(res1.replyText!, /เลือกบริการใหม่/);
  assert.equal(res1.quickReplyOptions?.length, 4);

  // With unknown device
  const res2 = evaluateBotTransition('new', {}, 'เปลี่ยนบริการ');
  assert.equal(res2.nextStatus, 'awaiting_device');
  assert.match(res2.replyText!, /เลือกประเภทอุปกรณ์/);
});

test('Command: ติดต่อช่าง hands off to technician and silences bot', () => {
  const res = evaluateBotTransition('awaiting_service', { device_type: 'PC' }, 'ติดต่อช่าง');
  assert.equal(res.nextStatus, 'completed');
  assert.equal(res.nextData.device_type, 'PC');
  assert.match(res.replyText!, /ส่งเรื่องให้ช่างแล้ว/);
  assert.equal(res.quickReplyOptions, undefined);
});

test('Command: เมนู shows command guide and quick reply options', () => {
  const res = evaluateBotTransition('awaiting_issue', { device_type: 'PC', service_category: 'อัปเกรดเครื่อง' }, 'เมนู');
  assert.equal(res.nextStatus, 'awaiting_issue');
  assert.equal(res.nextData.device_type, 'PC');
  assert.match(res.replyText!, /เมนูคำสั่งลัด/);
  assert.ok(res.quickReplyOptions && res.quickReplyOptions.length >= 3);
});
```

- [ ] **Step 2: Run test to make sure it fails**

Run: `npx tsx tests/line-commands.test.ts`.

- [ ] **Step 3: Implement command handling in `lib/line/bot.ts`**

Update `evaluateBotTransition`:
1. Reset commands: `['เริ่มใหม่', 'reset', '/reset', 'ลบแชท', 'ล้างแชท', 'ล้างข้อมูล']`
2. Change service commands: `['เลือกบริการใหม่', 'เปลี่ยนบริการ', 'เลือกงานใหม่', 'เปลี่ยนงาน']`
3. Contact human commands: `['ติดต่อช่าง', 'คุยกับคน', 'แอดมิน', 'โทร', 'ช่าง']`
4. Menu commands: `['เมนู', 'ช่วยเหลือ', 'help', '/help', 'คำสั่ง']`

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx tests/line-commands.test.ts`.

- [ ] **Step 5: Commit changes**

`git add lib/line/bot.ts tests/line-commands.test.ts`
`git commit -m "feat(line): add customer chat commands for reset, re-select service, technician handoff, and menu"`

---

### Task 2: Regression Testing and Build Verification

**Files:**
- Test: `tests/line-intake-e2e.test.ts`
- Test: `tests/line-reply-e2e.test.ts`

- [ ] **Step 1: Run all test suites**

Run: `npx tsx tests/line-commands.test.ts; npx tsx tests/line-types.test.ts; npx tsx tests/line-push.test.ts; npx tsx tests/line-reply-route.test.ts; npx tsx tests/line-reply-e2e.test.ts; npx tsx tests/line-intake-e2e.test.ts`.

- [ ] **Step 2: Run production build**

Run: `npm run build`.

- [ ] **Step 3: Commit and finalize**

`git commit --allow-empty -m "chore: verify all test suites and production build for LINE commands"`
