import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateBotTransition,
  buildLineReplyPayload,
  sendLineReply,
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

test('buildLineReplyPayload returns empty array when replyText is null', () => {
  const payload = buildLineReplyPayload({
    nextStatus: 'completed',
    nextData: {},
    replyText: null,
  });
  assert.deepEqual(payload, []);
});

test('sendLineReply returns false when credentials or tokens are missing', async () => {
  const result = await sendLineReply('', []);
  assert.equal(result, false);
});

