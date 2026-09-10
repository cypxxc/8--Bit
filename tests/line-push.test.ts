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
  let capturedBody: { to?: string; messages?: Array<{ type: string; text: string }> } | null = null;
  let capturedAuth = '';

  global.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    capturedUrl = String(url);
    capturedBody = JSON.parse(String(init?.body || '{}'));
    capturedAuth = String(init?.headers && (init.headers as Record<string, string>)['Authorization']);
    return new Response(JSON.stringify({}), { status: 200 });
  }) as typeof fetch;

  try {
    const result = await sendLinePushMessage('Utestuser', 'ทดสอบส่งข้อความ');
    assert.equal(result.ok, true);
    assert.equal(capturedUrl, 'https://api.line.me/v2/bot/message/push');
    assert.equal(capturedAuth, 'Bearer test-token');
    const body = capturedBody as { to?: string; messages?: Array<{ type: string; text: string }> } | null;
    assert.ok(body);
    assert.equal(body.to, 'Utestuser');
    assert.deepEqual(body.messages, [{ type: 'text', text: 'ทดสอบส่งข้อความ' }]);
  } finally {
    process.env.LINE_CHANNEL_ACCESS_TOKEN = origToken;
    global.fetch = origFetch;
  }
});
