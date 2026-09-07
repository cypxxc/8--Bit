// Run against a dedicated local production server with LINE token/recipient blank.
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { randomUUID, randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
import assert from "node:assert/strict";
loadEnvConfig(process.cwd());
const base = "http://localhost:3004";
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } },
);
const publicDb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  { auth: { persistSession: false } },
);
let cookie = "",
  userId = "";
const ids: string[] = [];
const serviceId = "test-" + randomUUID();
async function call(
  path: string,
  method = "GET",
  payload?: unknown,
  authenticated = true,
) {
  const res = await fetch(base + path, {
    method,
    headers: {
      Origin: base,
      ...(authenticated && cookie ? { Cookie: cookie } : {}),
      ...(payload ? { "Content-Type": "application/json" } : {}),
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  return {
    status: res.status,
    data: await res.json(),
    cookies: res.headers.getSetCookie(),
  };
}
async function main() {
  for (const path of ["jobs", "services", "summary", "notifications", "auth"])
    assert.equal((await call("/api/admin/" + path)).status, 401);
  console.log("PASS anonymous admin access denied");
  for (const table of [
    "shop_admins",
    "shop_services",
    "service_requests",
    "line_notifications",
    "shop_rate_limits",
  ]) {
    const { error } = await publicDb.from(table).select("*").limit(1);
    assert.ok(error, table + " must not be public");
  }
  console.log("PASS direct public database access denied");
  const email = `8bit-check-${randomUUID()}@example.invalid`,
    password = randomBytes(24).toString("base64url");
  const { data: user, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  userId = user.user!.id;
  assert.equal(
    (await call("/api/admin/auth", "POST", { email, password })).status,
    403,
  );
  console.log("PASS authenticated non-owner rejected");
  const { error: roleError } = await db
    .from("shop_admins")
    .insert({ user_id: userId });
  if (roleError) throw roleError;
  const login = await call("/api/admin/auth", "POST", { email, password });
  assert.equal(login.status, 200);
  cookie = login.cookies.map((c) => c.split(";")[0]).join("; ");
  assert.match(login.cookies.join(" "), /HttpOnly/i);
  const csrf = await fetch(base + "/api/admin/jobs", {
    method: "POST",
    headers: {
      Cookie: cookie,
      Origin: "https://untrusted.invalid",
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  assert.equal(csrf.status, 403);
  console.log("PASS owner login, HttpOnly cookies, cross-origin protection");
  const { error: serviceError } = await db
    .from("shop_services")
    .insert({
      id: serviceId,
      group_id: "software",
      name: "รายการทดสอบระบบ (ชั่วคราว)",
      active: false,
      sort_order: 9999,
    });
  if (serviceError) throw serviceError;
  const changed = await call("/api/admin/services", "PATCH", {
    id: serviceId,
    version: 1,
    name: "รายการทดสอบระบบ (ชั่วคราว)",
    description: "ทดสอบราคา",
    active: true,
    price: 125,
  });
  assert.equal(changed.status, 200);
  const catalog = await call("/api/services");
  assert.equal(
    catalog.data.services.find((s: { id: string }) => s.id === serviceId).price,
    125,
  );
  console.log("PASS service edits propagate to public catalog");
  const makePayload = () => ({
    idempotencyKey: randomUUID(),
    customerName: "ทดสอบระบบ 8bit — ไม่ใช่งานลูกค้า",
    phoneNumber: "0000000000",
    deviceType: "Desktop PC",
    deviceModel: "TEST DEVICE",
    description: "คำขอทดสอบที่จะลบหลังตรวจ",
    serviceIds: [serviceId],
  });
  const store = makePayload();
  const created = await call("/api/admin/jobs", "POST", store);
  assert.equal(created.status, 201);
  ids.push(created.data.job.id);
  const duplicate = await call("/api/admin/jobs", "POST", store);
  assert.equal(duplicate.status, 200);
  assert.equal(duplicate.data.job.id, created.data.job.id);
  const list = await call(
    "/api/admin/jobs?q=" + encodeURIComponent(created.data.job.ticket_code),
  );
  assert.equal(list.data.jobs.length, 1);
  const job = list.data.jobs[0];
  const change = {
    id: job.id,
    version: job.version,
    status: "ready",
    device_model: "TEST DEVICE",
    accessories: "สายชาร์จทดสอบ",
    internal_notes: "บันทึกภายในเท่านั้น",
    quoted_price: 650,
  };
  assert.equal((await call("/api/admin/jobs", "PATCH", change)).status, 200);
  assert.equal((await call("/api/admin/jobs", "PATCH", change)).status, 409);
  console.log(
    "PASS walk-in save, duplicate prevention, status/notes/price, stale edit rejected",
  );
  const web = makePayload();
  const webResult = await call("/api/ticket", "POST", web, false);
  assert.equal(webResult.status, 201);
  assert.equal(webResult.data.lineSent, false, "Test server must disable LINE");
  const { data: webJob, error: webError } = await db
    .from("service_requests")
    .select("id")
    .eq("idempotency_key", web.idempotencyKey)
    .single();
  if (webError) throw webError;
  ids.push(webJob.id);
  const repeated = await call("/api/ticket", "POST", web, false);
  assert.equal(repeated.data.ticketId, webResult.data.ticketId);
  const { data: logs } = await db
    .from("line_notifications")
    .select("*")
    .eq("request_id", webJob.id);
  assert.equal(logs?.length, 1);
  assert.equal(logs![0].status, "skipped");
  const retry = await call("/api/admin/notifications", "POST", {
    requestId: webJob.id,
  });
  assert.equal(retry.status, 200);
  assert.equal(retry.data.notification.status, "skipped");
  console.log(
    "PASS web intake saves before notification; no LINE sends; retry history retained",
  );
  await db
    .from("line_notifications")
    .update({ status: "accepted" })
    .eq("request_id", webJob.id);
  const accepted = await call("/api/admin/notifications", "POST", {
    requestId: webJob.id,
  });
  assert.equal(accepted.data.notification.attempts, 2);
  await db
    .from("line_notifications")
    .update({
      status: "uncertain",
      created_at: new Date(Date.now() - 25 * 3600000).toISOString(),
    })
    .eq("request_id", webJob.id);
  assert.equal(
    (await call("/api/admin/notifications", "POST", { requestId: webJob.id }))
      .status,
    409,
  );
  await db
    .from("line_notifications")
    .update({ status: "skipped", created_at: new Date().toISOString() })
    .eq("request_id", webJob.id);
  console.log(
    "PASS accepted messages are not sent again; expired uncertain retries refused",
  );
  const disabled = await call("/api/admin/services", "PATCH", {
    id: serviceId,
    version: 2,
    name: "รายการทดสอบระบบ (ชั่วคราว)",
    description: "",
    active: false,
    price: null,
  });
  assert.equal(disabled.status, 200);
  assert.equal(
    (await call("/api/ticket", "POST", makePayload(), false)).status,
    400,
  );
  assert.ok(
    !(await call("/api/services")).data.services.some(
      (s: { id: string }) => s.id === serviceId,
    ),
  );
  const { data: limits, error: limitsError } = await db.rpc(
    "shop_consume_limit",
    { p_key: "test-" + randomUUID(), p_max: 0, p_seconds: 60 },
  );
  assert.equal(limitsError, null);
  assert.equal(limits, false);
  console.log("PASS inactive services rejected; rate limit enforced");
  writeFileSync(
    ".env.backend-test",
    JSON.stringify({ email, password, userId, serviceId, ids, cookie }),
  );
  console.log(
    "PASS integration complete; temporary owner retained for browser verification",
  );
}
main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : "Integration error");
  if (ids.length) await db.from("service_requests").delete().in("id", ids);
  await db.from("shop_services").delete().eq("id", serviceId);
  if (userId) await db.auth.admin.deleteUser(userId);
  process.exitCode = 1;
});
