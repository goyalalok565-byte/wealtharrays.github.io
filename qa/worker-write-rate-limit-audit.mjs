import assert from "node:assert/strict";
import worker from "../worker.mjs";

const calls = [];
const limited = await worker.fetch(new Request("https://example.test/v1/scenarios", {
  method: "POST",
  headers: { "cf-connecting-ip": "203.0.113.10", "Content-Type": "application/json" },
  body: JSON.stringify({ calculator_id: "sip", inputs: {} })
}), {
  WRITE_API_LIMITER: { async limit(input) { calls.push(input.key); return { success: false }; } },
  ASSETS: { fetch() { return new Response("asset"); } }
}, {});

assert.equal(limited.status, 429);
assert.equal(limited.headers.get("Retry-After"), "60");
assert.equal((await limited.json()).error.code, "RATE_LIMITED");
assert.deepEqual(calls, ["/v1/scenarios:POST:203.0.113.10"]);

const missing = await worker.fetch(new Request("https://example.test/v1/billing/checkout", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ plan: "monthly" })
}), { ASSETS: { fetch() { return new Response("asset"); } } }, {});
assert.equal(missing.status, 503);
assert.equal((await missing.json()).error.code, "WRITE_RATE_LIMITER_NOT_CONFIGURED");

const failed = await worker.fetch(new Request("https://example.test/v1/billing/cancel", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: "{}"
}), {
  WRITE_API_LIMITER: { async limit() { throw new Error("simulated outage"); } },
  ASSETS: { fetch() { return new Response("asset"); } }
}, {});
assert.equal(failed.status, 503);
assert.equal((await failed.json()).error.code, "WRITE_API_RATE_LIMITER_UNAVAILABLE");

const readOnly = await worker.fetch(new Request("https://example.test/v1/scenarios", {
  method: "GET"
}), {
  WRITE_API_LIMITER: { async limit() { throw new Error("GET must not consume write quota"); } },
  ASSETS: { fetch() { return new Response("asset"); } }
}, {});
assert.equal(readOnly.status, 401, "GET scenario reads should proceed to authentication without consuming the write limiter");


const trailingSlashCalls = [];
const trailingSlash = await worker.fetch(new Request("https://example.test/v1/scenarios/", {
  method: "DELETE",
  headers: { "cf-connecting-ip": "203.0.113.11" }
}), {
  WRITE_API_LIMITER: { async limit(input) { trailingSlashCalls.push(input.key); return { success: true }; } },
  ASSETS: { fetch() { return new Response("asset"); } }
}, {});
assert.equal(trailingSlash.status, 401, "A trailing-slash write route should reach authentication after rate limiting");
assert.deepEqual(trailingSlashCalls, ["/v1/scenarios:DELETE:203.0.113.11"]);

console.log("Worker write rate-limit audit PASS: throttling, fail-closed configuration/outage, GET exemption, and trailing-slash routes.");
