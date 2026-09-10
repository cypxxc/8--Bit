import test from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';

test('Reply schema validates roomId and text boundaries', () => {
  const replySchema = z.object({
    roomId: z.string().uuid('รหัสห้องสนทนาไม่ถูกต้อง'),
    text: z.string().trim().min(1, 'กรุณาใส่ข้อความตอบกลับ').max(5000, 'ข้อความยาวเกินไป (สูงสุด 5,000 ตัวอักษร)'),
  });

  // Valid payload
  const valid = replySchema.safeParse({
    roomId: '123e4567-e89b-12d3-a456-426614174000',
    text: '   สวัสดีครับ ร้าน 8bit ยินดีให้บริการ   ',
  });
  assert.equal(valid.success, true);
  if (valid.success) {
    assert.equal(valid.data.text, 'สวัสดีครับ ร้าน 8bit ยินดีให้บริการ');
  }

  // Invalid UUID
  const invalidUuid = replySchema.safeParse({
    roomId: 'not-a-uuid',
    text: 'ข้อความ',
  });
  assert.equal(invalidUuid.success, false);

  // Empty text
  const emptyText = replySchema.safeParse({
    roomId: '123e4567-e89b-12d3-a456-426614174000',
    text: '     ',
  });
  assert.equal(emptyText.success, false);

  // Text > 5000 chars
  const tooLong = replySchema.safeParse({
    roomId: '123e4567-e89b-12d3-a456-426614174000',
    text: 'a'.repeat(5001),
  });
  assert.equal(tooLong.success, false);
});
