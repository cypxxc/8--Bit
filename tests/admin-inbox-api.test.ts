import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { type Conversation } from '../lib/line/types';

test('Conversation interface supports intake_status and intake_data', () => {
  const c: Conversation = {
    id: 'room-1',
    line_user_id: 'U12345678901234567890123456789012',
    display_name: 'Test Customer',
    picture_url: null,
    last_message_at: null,
    unread_count: 0,
    intake_status: 'completed',
    intake_data: { device_type: 'PC', service_category: 'ลง Windows / โปรแกรม', issue_description: 'เปิดไม่ติด' },
  };
  assert.equal(c.intake_status, 'completed');
  assert.equal(c.intake_data?.device_type, 'PC');
  assert.equal(c.intake_data?.service_category, 'ลง Windows / โปรแกรม');
});

test('GET /api/admin/inbox query includes intake_status and intake_data', () => {
  const routeContent = readFileSync('app/api/admin/inbox/route.ts', 'utf8');
  assert.match(routeContent, /intake_status/);
  assert.match(routeContent, /intake_data/);
});

test('POST /api/admin/inbox/intake route exists and implements intake reset', () => {
  assert.equal(existsSync('app/api/admin/inbox/intake/route.ts'), true);
  const intakeRoute = readFileSync('app/api/admin/inbox/intake/route.ts', 'utf8');
  assert.match(intakeRoute, /export\s+const\s+runtime\s*=\s*['"]nodejs['"]/);
  assert.match(intakeRoute, /export\s+async\s+function\s+POST/);
  assert.match(intakeRoute, /sameOrigin/);
  assert.match(intakeRoute, /requireOwner/);
  assert.match(intakeRoute, /shop_update_line_intake/);
  assert.match(intakeRoute, /awaiting_device/);
});
