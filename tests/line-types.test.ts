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
