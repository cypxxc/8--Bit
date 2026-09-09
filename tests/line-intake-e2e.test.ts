import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateBotTransition,
  buildLineReplyPayload,
  type IntakeStatus,
  type IntakeData,
} from '../lib/line/bot';

test('End-to-End LINE OA Intake Conversation Simulation', () => {
  // 1. Customer greeting
  let status: IntakeStatus = 'new';
  let data: IntakeData = {};
  
  const step1 = evaluateBotTransition(status, data, 'สวัสดีครับ อยากปรึกษาเรื่องคอม');
  assert.equal(step1.nextStatus, 'awaiting_device');
  assert.match(step1.replyText!, /เลือกประเภทอุปกรณ์/);
  assert.equal(step1.quickReplyOptions?.length, 2);
  const payload1 = buildLineReplyPayload(step1);
  assert.equal(payload1.length, 1);
  assert.equal(payload1[0].quickReply?.items.length, 2);
  
  status = step1.nextStatus;
  data = step1.nextData;

  // 2. Customer selects PC
  const step2 = evaluateBotTransition(status, data, 'คอมพิวเตอร์ตั้งโต๊ะ (PC)');
  assert.equal(step2.nextStatus, 'awaiting_service');
  assert.equal(step2.nextData.device_type, 'PC');
  assert.match(step2.replyText!, /เลือกบริการที่ต้องการ/);
  assert.equal(step2.quickReplyOptions?.length, 4);

  status = step2.nextStatus;
  data = step2.nextData;

  // 3. Customer selects Windows Setup service
  const step3 = evaluateBotTransition(status, data, '🪟 ลง Windows / โปรแกรม');
  assert.equal(step3.nextStatus, 'awaiting_issue');
  assert.equal(step3.nextData.service_category, 'ลง Windows / โปรแกรม');
  assert.match(step3.replyText!, /ช่วยพิมพ์เล่าอาการ/);

  status = step3.nextStatus;
  data = step3.nextData;

  // 4. Customer describes the problem
  const step4 = evaluateBotTransition(status, data, 'เปิดติดแต่จอดำ เข้า Windows ไม่ได้ครับ');
  assert.equal(step4.nextStatus, 'completed');
  assert.equal(step4.nextData.issue_description, 'เปิดติดแต่จอดำ เข้า Windows ไม่ได้ครับ');
  assert.ok(step4.nextData.completed_at);
  assert.match(step4.replyText!, /บันทึกข้อมูลเรียบร้อยแล้ว/);

  status = step4.nextStatus;
  data = step4.nextData;

  // 5. Subsequent message: bot is silent
  const step5 = evaluateBotTransition(status, data, 'ช่างสะดวกกี่โมงครับ');
  assert.equal(step5.nextStatus, 'completed');
  assert.equal(step5.replyText, null);
  const payload5 = buildLineReplyPayload(step5);
  assert.equal(payload5.length, 0);

  // 6. Reset keyword
  const step6 = evaluateBotTransition(status, data, 'เริ่มใหม่');
  assert.equal(step6.nextStatus, 'awaiting_device');
  assert.deepEqual(step6.nextData, {});
  assert.match(step6.replyText!, /กรุณาเลือกประเภทอุปกรณ์/);

  // 7. Verify prefill structure compatibility with JobForm
  const mockCustomer = {
    display_name: 'สมชาย นักรบไซเบอร์',
    line_user_id: 'U1234567890abcdef1234567890abcdef',
  };
  const prefill = {
    customer_name: mockCustomer.display_name,
    device_type: data.device_type === 'Notebook' ? 'Notebook' : 'PC',
    description: data.issue_description || '',
    line_id: mockCustomer.line_user_id,
  };
  assert.equal(prefill.customer_name, 'สมชาย นักรบไซเบอร์');
  assert.equal(prefill.device_type, 'PC');
  assert.equal(prefill.description, 'เปิดติดแต่จอดำ เข้า Windows ไม่ได้ครับ');
  assert.equal(prefill.line_id, 'U1234567890abcdef1234567890abcdef');
});
