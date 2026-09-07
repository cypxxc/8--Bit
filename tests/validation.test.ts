import { test } from "node:test";
import assert from "node:assert/strict";
import {
  intakeSchema,
  updateJobSchema,
  serviceSchema,
} from "../lib/backend/validation";
const input = {
  idempotencyKey: "00000000-0000-4000-8000-000000000001",
  customerName: " ลูกค้าทดสอบ ",
  phoneNumber: "0800000000",
  deviceType: "Desktop PC",
  serviceIds: ["software-1"],
};
test("intake trims fields and ignores injected privileged fields", () => {
  const result = intakeSchema.parse({
    ...input,
    status: "delivered",
    quoted_price: 0,
    internal_notes: "injected",
  });
  assert.equal(result.customerName, "ลูกค้าทดสอบ");
  assert.equal("status" in result, false);
  assert.equal("internal_notes" in result, false);
});
test("rejects empty selection, duplicates, malformed ids, phones and oversized notes", () => {
  for (const fields of [
    { serviceIds: [] },
    { serviceIds: ["software-1", "software-1"] },
    { idempotencyKey: "wrong" },
    { phoneNumber: "abc" },
    { description: "x".repeat(2001) },
  ])
    assert.equal(
      intakeSchema.safeParse({ ...input, ...fields }).success,
      false,
    );
});
test("job edits require version and reject invalid status or price", () => {
  const job = {
    id: input.idempotencyKey,
    version: 1,
    status: "ready",
    device_model: "PC",
    accessories: "",
    internal_notes: "",
    quoted_price: 0,
  };
  assert.equal(updateJobSchema.safeParse(job).success, true);
  for (const fields of [
    { version: 0 },
    { status: "unknown" },
    { quoted_price: -1 },
  ])
    assert.equal(
      updateJobSchema.safeParse({ ...job, ...fields }).success,
      false,
    );
});
test("service price can be blank or zero, but not negative", () => {
  const service = {
    id: "software-1",
    version: 1,
    name: "Windows",
    description: "",
    price: null,
    active: false,
  };
  assert.equal(serviceSchema.safeParse(service).success, true);
  assert.equal(serviceSchema.safeParse({ ...service, price: 0 }).success, true);
  assert.equal(
    serviceSchema.safeParse({ ...service, price: -1 }).success,
    false,
  );
});
