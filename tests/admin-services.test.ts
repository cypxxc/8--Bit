import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('app/api/admin/services/route.ts implements GET, POST, PATCH, and DELETE handlers', () => {
  const content = readFileSync('app/api/admin/services/route.ts', 'utf8');
  assert.match(content, /export\s+async\s+function\s+GET/);
  assert.match(content, /export\s+async\s+function\s+POST/);
  assert.match(content, /export\s+async\s+function\s+PATCH/);
  assert.match(content, /export\s+async\s+function\s+DELETE/);
  assert.match(content, /deleteServiceSchema/);
  assert.match(content, /createServiceSchema/);
  assert.match(content, /requireOwner/);
  assert.match(content, /sameOrigin/);
});

test('ServiceEditor component includes delete button with danger styling and confirmation', () => {
  const content = readFileSync('components/admin/ServiceEditor.tsx', 'utf8');
  assert.match(content, /onDeleted/);
  assert.match(content, /window\.confirm/);
  assert.match(content, /api\(["']\/api\/admin\/services["'],\s*["']DELETE["']/);
  assert.match(content, /className=["'][^"']*admin-button\s+danger[^"']*["']/);
  assert.match(content, /ลบบริการ/);
});

test('AdminApp services tab wires up onDeleted callback and add service form', () => {
  const content = readFileSync('components/admin/AdminApp.tsx', 'utf8');
  assert.match(content, /onDeleted=/);
  assert.match(content, /ลบบริการ.*ออกจากแคตตาล็อกแล้ว/);
  assert.match(content, /showNewService/);
  assert.match(content, /handleCreateService/);
  assert.match(content, /เพิ่มบริการใหม่/);
});
