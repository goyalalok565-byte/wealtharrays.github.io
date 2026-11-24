import test from "node:test";
import assert from "node:assert/strict";
import { enforceRateLimit } from "../functions/v1/_shared.js";
import { onRequestGet as scenariosGet, onRequestPost as scenariosPost, onRequestDelete as scenariosDelete } from "../functions/v1/scenarios.js";
import { onRequestPost as checkoutPost } from "../functions/v1/billing/checkout.js";
import { onRequestPost as cancelPost } from "../functions/v1/billing/cancel.js";

test("rate limiter allows requests when the binding accepts the key", async () => {
  const response = await enforceRateLimit({ PUBLIC_API_LIMITER: { limit: async () => ({ success: true }) } }, "test:user");
  assert.equal(response, null);
});

test("rate limiter returns 429 with Retry-After when the binding denies a request", async () => {
  const response = await enforceRateLimit({ PUBLIC_API_LIMITER: { limit: async () => ({ success: false }) } }, "test:user");
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("Retry-After"), "60");
  assert.equal((await response.json()).error.code, "RATE_LIMITED");
});

test("rate limiter fails closed when the binding is absent or unavailable", async () => {
  const missing = await enforceRateLimit({}, "test:user");
  assert.equal(missing.status, 503);
  assert.equal((await missing.json()).error.code, "RATE_LIMITER_NOT_CONFIGURED");
  const unavailable = await enforceRateLimit({ PUBLIC_API_LIMITER: { limit: async () => { throw new Error("binding unavailable"); } } }, "test:user");
  assert.equal(unavailable.status, 503);
  assert.equal((await unavailable.json()).error.code, "RATE_LIMITER_UNAVAILABLE");
});

async function invokeAuthenticated(handler, method, path, body, bucket) {
  const originalFetch = globalThis.fetch;
  const keys = [];
  globalThis.fetch = async () => new Response(JSON.stringify({ id: "user-1", email: "test@example.invalid" }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
  const request = new Request("https://wealtharrays.com" + path, {
    method,
    headers: { Authorization: "Bearer test-session", ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  try {
    const response = await handler({
      request,
      env: {
        SUPABASE_URL: "https://test-project.supabase.co",
        SUPABASE_ANON_KEY: "test-anon-key",
        PUBLIC_API_LIMITER: {
          limit: async ({ key }) => {
            keys.push(key);
            return { success: false };
          }
        }
      }
    });
    assert.equal(response.status, 429, method + " " + path + " must be rate limited");
    assert.equal(response.headers.get("Retry-After"), "60");
    assert.equal((await response.json()).error.code, "RATE_LIMITED");
    assert.deepEqual(keys, [bucket + ":user-1"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test("scenario GET is rate limited per authenticated user", async () => {
  await invokeAuthenticated(scenariosGet, "GET", "/v1/scenarios", undefined, "scenarios");
});

test("scenario POST is rate limited per authenticated user before body processing", async () => {
  await invokeAuthenticated(scenariosPost, "POST", "/v1/scenarios", { calculator_id: "sip", inputs: { monthly: 1000 } }, "scenarios");
});

test("scenario DELETE is rate limited per authenticated user", async () => {
  await invokeAuthenticated(scenariosDelete, "DELETE", "/v1/scenarios?id=scenario-1", undefined, "scenarios");
});

test("billing checkout is rate limited per authenticated user", async () => {
  await invokeAuthenticated(checkoutPost, "POST", "/v1/billing/checkout", { plan: "monthly" }, "billing-checkout");
});

test("billing cancellation is rate limited per authenticated user", async () => {
  await invokeAuthenticated(cancelPost, "POST", "/v1/billing/cancel", {}, "billing-cancel");
});
