import { test } from "node:test";
import assert from "node:assert/strict";
import { clientIp, validRequestOrigin } from "../lib/request-security";

const request = (headers: Record<string, string>) => new Request("http://localhost:3000/api/admin/jobs", {headers});
test("untrusted forwarded IPs cannot create separate rate-limit buckets", () => {
  for (const ip of ["1.2.3.4", "5.6.7.8", "1.2.3.4, 5.6.7.8"]) {
    assert.equal(clientIp(request({"x-forwarded-for":ip})), "unverified");
  }
  assert.equal(clientIp(request({"x-real-ip":"1.2.3.4"}), "x-real-ip"), "1.2.3.4");
  assert.equal(clientIp(request({"x-real-ip":"1.2.3.4, 5.6.7.8"}), "x-real-ip"), "unverified");
  assert.equal(clientIp(request({"x-real-ip":"not-an-ip"}), "x-real-ip"), "unverified");
  assert.equal(clientIp(request({"x-real-ip":"2001:0db8:0:0:0:0:0:1"}), "x-real-ip"), "[2001:db8::1]");
});
test("mutation origins reject external, missing, opaque and cross-site requests", () => {
  for (const headers of [{}, {origin:"null"}, {origin:"https://evil.example"}, {origin:"http://localhost:3000", "sec-fetch-site":"cross-site"}]) {
    assert.equal(validRequestOrigin(request(headers as Record<string,string>)), false);
  }
  assert.equal(validRequestOrigin(request({origin:"http://localhost:3000"})), true);
  assert.equal(validRequestOrigin(request({host:"127.0.0.1:3000", origin:"http://127.0.0.1:3000"})), true);
});
test("configured HTTPS origin is authoritative behind a proxy", () => {
  assert.equal(validRequestOrigin(request({origin:"https://shop.example",host:"internal:3000"}), "https://shop.example"), true);
  assert.equal(validRequestOrigin(request({origin:"https://evil.example",host:"evil.example"}), "https://shop.example"), false);
});
