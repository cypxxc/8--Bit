import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('migration script adds intake_status and intake_data columns with valid constraints', () => {
  const sql = readFileSync('supabase/migrations/20260909090000_line_bot_intake.sql', 'utf8');
  assert.match(sql, /intake_status/);
  assert.match(sql, /intake_data/);
  assert.match(sql, /awaiting_device/);
  assert.match(sql, /awaiting_service/);
  assert.match(sql, /awaiting_issue/);
  assert.match(sql, /completed/);
  assert.match(sql, /shop_update_line_intake/);
});
