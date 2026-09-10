import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateBotTransition,
  sendLinePushMessage,
  type IntakeStatus,
  type IntakeData,
} from '../lib/line/bot';
import type { ChatMessage, Conversation } from '../lib/line/types';

test('End-to-End Simulation: Customer Chat & Admin Direct Reply Cycle', async () => {
  // 1. Customer initiates chat
  let status: IntakeStatus = 'new';
  let data: IntakeData = {};
  const customerEvent = evaluateBotTransition(status, data, 'สอบถามเรื่องการซ่อมคอมพิวเตอร์ครับ');
  assert.equal(customerEvent.nextStatus, 'awaiting_device');
  assert.ok(customerEvent.replyText);

  status = customerEvent.nextStatus;
  data = customerEvent.nextData;

  const conversation: Conversation = {
    id: 'room-uuid-1234',
    line_user_id: 'Ucustomer999',
    display_name: 'สมชาย ซ่อมคอม',
    picture_url: null,
    last_message_at: new Date().toISOString(),
    unread_count: 1,
    intake_status: status,
    intake_data: data,
  };

  const messages: ChatMessage[] = [
    {
      id: 1,
      conversation_id: conversation.id,
      kind: 'text',
      text: 'สอบถามเรื่องการซ่อมคอมพิวเตอร์ครับ',
      unsent: false,
      sender: 'customer',
      sent_at: new Date().toISOString(),
      metadata: {},
    },
  ];

  assert.equal(messages[0].sender, 'customer');
  assert.equal(conversation.intake_status, 'awaiting_device');

  // 2. Admin intervenes and sends direct reply via push
  const origToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  process.env.LINE_CHANNEL_ACCESS_TOKEN = 'test-token-123';
  const origFetch = global.fetch;

  let capturedUrl = '';
  let capturedBody: { to?: string; messages?: Array<{ type: string; text: string }> } | null = null;

  global.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    capturedUrl = String(url);
    capturedBody = JSON.parse(String(init?.body || '{}'));
    return new Response(JSON.stringify({}), { status: 200 });
  }) as typeof fetch;

  try {
    const adminReplyText = 'สวัสดีครับคุณสมชาย ช่างจากร้าน 8bit รับเรื่องแล้วครับ มีอาการอย่างไรบ้างครับ?';
    const pushRes = await sendLinePushMessage(conversation.line_user_id, adminReplyText);
    assert.equal(pushRes.ok, true);
    assert.equal(capturedUrl, 'https://api.line.me/v2/bot/message/push');
    const body = capturedBody as { to?: string; messages?: Array<{ type: string; text: string }> } | null;
    assert.ok(body);
    assert.equal(body.to, 'Ucustomer999');
    assert.equal(body.messages?.[0].text, adminReplyText);

    // 3. System persists admin message with sender = 'shop'
    const shopMessage: ChatMessage = {
      id: 2,
      conversation_id: conversation.id,
      kind: 'text',
      text: adminReplyText,
      unsent: false,
      sender: 'shop',
      sent_at: new Date().toISOString(),
      metadata: {},
    };
    messages.push(shopMessage);

    // 4. Auto handoff: intake_status transitions to 'completed'
    let currentIntake: IntakeStatus = (conversation.intake_status as IntakeStatus) || 'new';
    if (currentIntake !== 'completed') {
      currentIntake = 'completed';
      conversation.intake_status = currentIntake;
    }

    assert.equal(conversation.intake_status, 'completed');
    assert.equal(messages.length, 2);
    assert.equal(messages[0].sender, 'customer');
    assert.equal(messages[1].sender, 'shop');

    // 5. Subsequent message from customer will not trigger bot prompts
    const followUp = evaluateBotTransition(currentIntake, data, 'คอมเปิดไม่ติดครับ');
    assert.equal(followUp.nextStatus, 'completed');
    assert.equal(followUp.replyText, null);
  } finally {
    process.env.LINE_CHANNEL_ACCESS_TOKEN = origToken;
    global.fetch = origFetch;
  }
});
