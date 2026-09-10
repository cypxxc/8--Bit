# Design Specification: LINE OA Customer Chat Commands & Quick Actions

- **Date:** 2026-09-10
- **Project:** 8bit
- **Status:** Approved by User
- **Author:** Antigravity (AI Assistant) & Shop Owner

---

## 1. Overview & Problem Statement
Currently, customers interacting with the shop's LINE Official Account (LINE OA) are guided through an intake wizard (Device -> Service -> Issue). While customers can type `เริ่มใหม่` or `reset` to start over, they lack explicit, discoverable commands to:
1. Clear/reset intake data (`ลบแชท`, `เริ่มใหม่`).
2. Re-select or change their requested service without re-answering the device type (`เลือกบริการใหม่`, `เปลี่ยนบริการ`).
3. Request immediate human assistance from the technician (`ติดต่อช่าง`, `คุยกับคน`).
4. Discover all available commands via a 1-tap quick action menu (`เมนู`, `ช่วยเหลือ`, `help`).

This feature implements keyword command matching and native LINE Quick Reply buttons to empower customers with direct control over their conversation flow.

---

## 2. Command Specifications & State Transitions

The bot engine in `lib/line/bot.ts` evaluates incoming text events with priority command matching before standard intake evaluation:

### 2.1 Reset & Clear Chat (`ลบแชท`, `เริ่มใหม่`, `reset`, `/reset`)
- **Intent:** Customer wants to wipe previous intake triage data and restart from scratch.
- **Behavior:**
  - `nextStatus`: `'awaiting_device'`
  - `nextData`: `{}`
  - `replyText`: `"🕹️ 8bit Shop Assistant: รีเซ็ตข้อมูลเรียบร้อยครับ!\n\nกรุณาเลือกประเภทอุปกรณ์ของคุณ เพื่อเริ่มต้นใหม่อีกครั้ง:"`
  - `quickReplyOptions`: Device selection options (`🖥️ คอมตั้งโต๊ะ (PC)`, `💻 โน้ตบุ๊ก (Notebook)`).

### 2.2 Change Service Category (`เลือกบริการใหม่`, `เปลี่ยนบริการ`, `เลือกงานใหม่`)
- **Intent:** Customer wants to change their requested repair or upgrade service.
- **Behavior:**
  - If `data.device_type` exists:
    - `nextStatus`: `'awaiting_service'`
    - `nextData`: `{ device_type: data.device_type }` (clears previous `service_category` and `issue_description`)
    - `replyText`: `"📋 เลือกบริการใหม่สำหรับ (${data.device_type})\nกรุณาเลือกบริการที่ต้องการครับ:"`
    - `quickReplyOptions`: All 4 service options (`🪟 ลง Windows / โปรแกรม`, `⚡ อัปเกรดเครื่อง (RAM/SSD)`, `🧹 ตรวจเช็ก / ทำความสะอาด`, `💬 ปรึกษาอาการทั่วไป`).
  - If `data.device_type` is unknown:
    - Falls back to prompting for device selection first.

### 2.3 Hand-off to Human Technician (`ติดต่อช่าง`, `คุยกับคน`, `แอดมิน`, `โทร`)
- **Intent:** Customer wants to speak directly with the human shop owner/technician.
- **Behavior:**
  - `nextStatus`: `'completed'`
  - `nextData`: `data` (preserves existing intake data if any)
  - `replyText`: `"🧑‍🔧 ส่งเรื่องให้ช่างแล้วครับ!\nช่างได้รับแจ้งเตือนแล้ว และจะรีบเข้ามาตรวจสอบพร้อมตอบกลับในแชตนี้สักครู่นะครับ 🙏"`
  - `quickReplyOptions`: `[]` (no quick replies; bot silences future automatic prompts).

### 2.4 Command Menu & Help (`เมนู`, `ช่วยเหลือ`, `help`, `คำสั่ง`)
- **Intent:** Customer wants to view available commands and actions.
- **Behavior:**
  - `nextStatus`: `status` (maintains current conversation state)
  - `nextData`: `data` (maintains current data)
  - `replyText`: `"🕹️ เมนูคำสั่งลัด 8bit Shop:\n\n• พิมพ์ 'เริ่มใหม่' หรือ 'ลบแชท' เพื่อเริ่มต้นใหม่\n• พิมพ์ 'เลือกบริการใหม่' เพื่อเปลี่ยนรายการบริการ\n• พิมพ์ 'ติดต่อช่าง' เพื่อรอคุยกับช่างโดยตรง\n\nหรือกดปุ่มด้านล่างนี้ได้เลยครับ 👇"`
  - `quickReplyOptions`:
    - `🔄 ลบแชท/เริ่มใหม่` (text: `'เริ่มใหม่'`)
    - `📋 เลือกบริการใหม่` (text: `'เลือกบริการใหม่'`)
    - `🧑‍🔧 ติดต่อช่าง` (text: `'ติดต่อช่าง'`)

---

## 3. Architecture & Data Flow

```
[Customer sends message in LINE]
                ↓
    [POST /api/line/webhook]
                ↓
    [evaluateBotTransition]
                ↓
   Is text a command keyword?
     ├── 'ลบแชท' / 'เริ่มใหม่' ──> Reset data, return device quick replies
     ├── 'เลือกบริการใหม่'     ──> Reset service, return service quick replies
     ├── 'ติดต่อช่าง'          ──> Set status='completed', silence bot
     └── 'เมนู' / 'help'       ──> Return help text + all action quick replies
     └── No match ─────────────> Follow standard intake state machine
                ↓
    [sendLineReply with replyToken & quickReply items]
```

---

## 4. Edge Cases & Resilience

1. **Commands sent during completed conversation:**
   - Even if the intake is already marked `'completed'`, typing `ลบแชท`, `เริ่มใหม่`, `เลือกบริการใหม่`, or `เมนู` MUST still trigger the command and transition state appropriately.
2. **Whitespace & Case Insensitivity:**
   - Inputs like `"  /reset  "`, `"HELP"`, `"เมนู "` are trimmed and normalized.
3. **Quick Reply action limits:**
   - Quick reply action labels are strictly clamped to max 20 characters (per LINE Messaging API spec).

---

## 5. Verification Plan

1. **Unit Tests (`tests/line-commands.test.ts`):**
   - Test reset command (`ลบแชท`, `เริ่มใหม่`, `reset`) resets status to `awaiting_device` and clears data.
   - Test `เลือกบริการใหม่` preserves `device_type` and prompts with service options.
   - Test `ติดต่อช่าง` sets status to `completed` and silences bot.
   - Test `เมนู` returns all 3 action buttons without losing current state.
   - Test commands work even when conversation was already `completed`.
2. **End-to-End Simulation:**
   - Verify complete multi-command conversation simulations pass in test runner.
3. **Build Check:**
   - `npx tsc --noEmit` and `npm run build` pass cleanly.
