# Design Specification: LINE OA Intake Chatbot & Admin Integration

- **Date:** 2026-09-09
- **Project:** 8bit
- **Status:** Approved by User

---

## 1. Overview & Problem Statement
Currently, customers can contact the shop through LINE Official Account (LINE OA). In the admin dashboard (`/admin`), the shop owner can view incoming messages under the "แชตลูกค้า LINE" (LineInbox) tab. However, all customer triage and initial data collection must be done manually by the shop owner.

The goal is to provide an automated conversational chatbot on LINE OA that gathers initial service requirements from the customer (Device Type, Service Category, and Problem Details) before handing off the conversation to the human technician. Once completed, this collected intake data is displayed in the admin backend with a one-click button to generate a formal service job (`JobForm`).

---

## 2. Conversation Flow & State Machine

The chatbot operates as a state machine keyed by `line_user_id` / `conversation_id`.

```
[Customer sends message / follows OA]
              ↓
   [State: awaiting_device]
   Bot replies via Quick Reply:
   - 🖥️ คอมตั้งโต๊ะ (PC)
   - 💻 โน้ตบุ๊ก (Notebook)
              ↓
   [Customer selects Device → State: awaiting_service]
   Bot saves device_type and replies via Quick Reply:
   - 🪟 ลง Windows / โปรแกรม
   - ⚡ อัปเกรดเครื่อง (RAM / SSD / การ์ดจอ)
   - 🧹 ตรวจเช็ก / ทำความสะอาด
   - 💬 อื่นๆ / ปรึกษาทั่วไป
              ↓
   [Customer selects Service → State: awaiting_issue]
   Bot saves service_category and prompts:
   "ช่วยพิมพ์เล่าอาการ หรือปัญหาที่พบเพิ่มเติมสั้นๆ ให้หน่อยครับ (หรือถ่ายรูป/วิดีโออาการส่งมาได้เลย)"
              ↓
   [Customer sends text/image → State: completed]
   Bot saves issue details and replies with confirmation:
   "🎮 บันทึกข้อมูลเบื้องต้นเรียบร้อยแล้วครับ! ช่างได้รับข้อมูลแล้ว และจะเข้ามาตรวจสอบพร้อมตอบกลับในแชตนี้สักครู่นะครับ"
              ↓
   [Handoff to Technician]
   Bot stops automated replies. The shop owner can chat freely via LINE OA Manager or view in Admin.
```

### Reset Keyword
If the customer or technician wants to restart the triage flow, sending `เริ่มใหม่` or `reset` at any point resets `intake_status` back to `awaiting_device` and re-triggers the device selection prompt.

---

## 3. Architecture & Data Flow

### 3.1 Webhook & Messaging API
1. **Webhook Endpoint:** `POST /api/line/webhook` (and Supabase Edge Function `line-webhook`)
   - Verifies LINE HMAC-SHA256 signature (`x-line-signature`).
   - Normalizes incoming events (including `replyToken` for messages/follow events).
   - Ingests event into database (`shop_receive_line`).
2. **Bot Handler:**
   - Evaluates current conversation `intake_status` and `intake_data`.
   - Formulates the next prompt using LINE Messaging API (`https://api.line.me/v2/bot/message/reply`).
   - Uses `replyToken` with Quick Reply items (`quickReply.items`) to provide native, 1-tap buttons on LINE mobile and desktop.
   - Falls back to push message or logs gracefully if `replyToken` is expired or invalid.
3. **Notification to Shop Owner:**
   - When intake reaches `completed`, an admin notification is queued or sent via `LINE_ADMIN_USER_ID` alerting the owner that a new customer has completed the intake.

### 3.2 Database Schema Changes
Update `line_conversations` in PostgreSQL / Supabase:

```sql
ALTER TABLE public.line_conversations
ADD COLUMN IF NOT EXISTS intake_status text NOT NULL DEFAULT 'new'
  CHECK (intake_status IN ('new', 'awaiting_device', 'awaiting_service', 'awaiting_issue', 'completed')),
ADD COLUMN IF NOT EXISTS intake_data jsonb NOT NULL DEFAULT '{}'::jsonb;
```

**`intake_data` JSON Structure:**
```json
{
  "device_type": "PC",
  "service_category": "ลง Windows / โปรแกรม",
  "issue_description": "เปิดไม่ติด มีไฟกระพริบ",
  "completed_at": "2026-09-09T08:25:00.000Z"
}
```

RPC updates:
- Update `shop_receive_line` to accept and track `replyToken`, manage state transitions, or provide an atomic state progression function `shop_progress_line_intake`.

---

## 4. Admin Backend UI & Features (`LineInbox.tsx`)

### 4.1 Room List Badges
In the room list (`aside.line-rooms`):
- Display badges based on `intake_status`:
  - `completed`: A green retro pill `[🤖 ข้อมูลครบแล้ว]`
  - `awaiting_*`: A muted yellow/gray pill `[กำลังคุยกับบอท]`
- Add a filter option to show only rooms with completed intake.

### 4.2 Intake Summary Banner
When an admin opens a conversation with `intake_status === 'completed'`:
- Display a prominent 8-bit themed panel at the top of the chat thread:
  - **Device Type:** e.g., 🖥️ คอมตั้งโต๊ะ (PC)
  - **Service:** e.g., 🪟 ลง Windows / โปรแกรม
  - **Symptoms / Description:** e.g., "เครื่องค้างหน้าโลโก้"
  - **Actions:**
    - `[ ➕ สร้างเป็นงานบริการ (CREATE JOB) ]`
    - `[ 🔄 รีเซ็ตบอท ]`

### 4.3 One-Click Job Creation (`JobForm` prefill)
Clicking `[ ➕ สร้างเป็นงานบริการ ]`:
- Opens `JobForm` with initial values populated:
  - `customer_name`: `conversation.display_name`
  - `device_type`: `intake_data.device_type` ('PC' | 'Notebook')
  - `service_names`: Selected service category or matched catalog service
  - `description`: `intake_data.issue_description`
  - `source`: 'line'
- The admin only needs to review, add a quoted price if desired, and click Save.

---

## 5. Security, Rules & Compliance
- Follows all guidelines in `PRODUCT.md` and `AGENTS.md`:
  - Device selection is strictly PC and Notebook.
  - Services match approved catalog (Windows/software setup, upgrades, cleaning). No fake repair claims.
  - CRT scanlines default off.
  - Dark navy, cyan, and green 8-bit retro theme.
  - Uses Thai copy for customer and admin interactions.

---

## 6. Testing & Verification Plan
1. **Unit / Integration Tests:**
   - Webhook signature verification and `replyToken` parsing.
   - State machine transition tests:
     - `new` -> sends device quick reply -> `awaiting_device`
     - Device selected -> sends service quick reply -> `awaiting_service`
     - Service selected -> sends issue prompt -> `awaiting_issue`
     - Text/image sent -> sends completion confirmation -> `completed`
     - `เริ่มใหม่` keyword resets flow to `awaiting_device`.
2. **Admin UI Verification:**
   - Verify summary card displays correctly for completed intake.
   - Verify clicking `[ ➕ สร้างเป็นงานบริการ ]` correctly opens and prefills `JobForm`.
   - Verify saving the job successfully persists to `service_requests`.
