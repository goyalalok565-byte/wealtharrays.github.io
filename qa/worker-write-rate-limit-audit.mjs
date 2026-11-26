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
assert.equal(trailingSlash.status, 503, "A trailing-slash write route must still fail closed when Turnstile is not configured");
assert.equal((await trailingSlash.json()).error.code, "TURNSTILE_NOT_CONFIGURED");
assert.deepEqual(trailingSlashCalls, ["/v1/scenarios:DELETE:203.0.113.11"]);


const scenarioPreflight = await worker.fetch(new Request("https://example.test/v1/scenarios", {
  method: "OPTIONS", headers: { Origin: "https://wealtharrays.com", "Access-Control-Request-Headers": "authorization,content-type,cf-turnstile-response" }
}), {}, {});
assert.equal(scenarioPreflight.status, 204);
assert.match(scenarioPreflight.headers.get("Access-Control-Allow-Headers"), /cf-turnstile-response/i);

const checkoutPreflight = await worker.fetch(new Request("https://example.test/v1/billing/checkout", {
  method: "OPTIONS", headers: { Origin: "https://wealtharrays.com", "Access-Control-Request-Headers": "authorization,content-type,cf-turnstile-response" }
}), {}, {});
assert.equal(checkoutPreflight.status, 204);
assert.match(checkoutPreflight.headers.get("Access-Control-Allow-Headers"), /cf-turnstile-response/i);

const originalFetch = globalThis.fetch;
let siteverifyCalls = 0;
globalThis.fetch = async (url, options) => {
  if (String(url) === "https://challenges.cloudflare.com/turnstile/v0/siteverify") {
    siteverifyCalls++;
    const form = new URLSearchParams(options.body);
    assert.equal(form.get("secret"), "test-turnstile-secret");
    assert.ok(form.get("response"));
    if (form.get("response") === "network-test-token") throw new Error("simulated Siteverify outage");
    return Response.json({ success: form.get("response") === "valid-test-token", hostname: "wealtharrays.com", action: "wealth_arrays_action" });
  }
  if (String(url).endsWith("/auth/v1/user")) return new Response(JSON.stringify({ message: "invalid token" }), { status: 401 });
  throw new Error("Unexpected fetch in test: " + url);
};
try {
  const turnstileEnv = {
    TURNSTILE_SECRET_KEY: "test-turnstile-secret",
    WRITE_API_LIMITER: { async limit() { return { success: true }; } },
    SUPABASE_URL: "https://project.supabase.co",
    SUPABASE_ANON_KEY: "public-test-anon-key",
    ASSETS: { fetch() { return new Response("asset"); } }
  };
  const noToken = await worker.fetch(new Request("https://example.test/v1/scenarios", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ calculator_id: "sip", inputs: {} })
  }), turnstileEnv, {});
  assert.equal(noToken.status, 403);
  assert.equal((await noToken.json()).error.code, "TURNSTILE_REQUIRED");
  assert.equal(siteverifyCalls, 0, "Missing tokens must not be sent to Siteverify");

  const validToken = await worker.fetch(new Request("https://example.test/v1/scenarios", {
    method: "POST", headers: { "Content-Type": "application/json", "cf-turnstile-response": "valid-test-token" },
    body: JSON.stringify({ calculator_id: "sip", inputs: {} })
  }), turnstileEnv, {});
  assert.equal(validToken.status, 401, "A valid Turnstile token should pass verification before auth is checked");
  assert.equal(siteverifyCalls, 1);
  assert.match(validToken.headers.get("Access-Control-Allow-Headers"), /cf-turnstile-response/i);

  const invalidToken = await worker.fetch(new Request("https://example.test/v1/scenarios", {
    method: "POST", headers: { "Content-Type": "application/json", "cf-turnstile-response": "invalid-test-token" },
    body: JSON.stringify({ calculator_id: "sip", inputs: {} })
  }), turnstileEnv, {});
  assert.equal(invalidToken.status, 403);
  assert.equal((await invalidToken.json()).error.code, "TURNSTILE_FAILED");

  const siteverifyOutage = await worker.fetch(new Request("https://example.test/v1/scenarios", {
    method: "POST", headers: { "Content-Type": "application/json", "cf-turnstile-response": "network-test-token" },
    body: JSON.stringify({ calculator_id: "sip", inputs: {} })
  }), turnstileEnv, {});
  assert.equal(siteverifyOutage.status, 503);
  assert.equal((await siteverifyOutage.json()).error.code, "TURNSTILE_UNAVAILABLE");

  const missingSecret = await worker.fetch(new Request("https://example.test/v1/billing/checkout", {
    method: "POST", headers: { "Content-Type": "application/json", "cf-turnstile-response": "valid-test-token" },
    body: JSON.stringify({ plan: "monthly" })
  }), { WRITE_API_LIMITER: { async limit() { return { success: true }; } } }, {});
  assert.equal(missingSecret.status, 503);
  assert.equal((await missingSecret.json()).error.code, "TURNSTILE_NOT_CONFIGURED");
} finally {
  globalThis.fetch = originalFetch;
}

console.log("Worker write security audit PASS: edge throttling, fail-closed limiter, Turnstile Siteverify, missing-token/secret handling, and CORS.");
