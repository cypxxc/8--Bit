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
  const res1 = evaluateBotTransition('completed', { device_type: 'PC', service_category: 'ลง Windows / โปรแกรม' }, 'เลือกบริการใหม่');
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
  const res = evaluateBotTransition('awaiting_issue', { device_type: 'PC', service_category: 'อัปเกรดเครื่อง (RAM/SSD)' }, 'เมนู');
  assert.equal(res.nextStatus, 'awaiting_issue');
  assert.equal(res.nextData.device_type, 'PC');
  assert.match(res.replyText!, /เมนูคำสั่งลัด/);
  assert.ok(res.quickReplyOptions && res.quickReplyOptions.length >= 3);
});
