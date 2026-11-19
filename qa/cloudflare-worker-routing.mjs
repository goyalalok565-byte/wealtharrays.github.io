import fs from 'node:fs';
import assert from "node:assert/strict";
import worker from "../worker.mjs";

const assetCalls = [];
let limiterCalls = 0;
let privateLimiterCalls = 0;
let allowRateLimitedRequest = true;
let allowPrivateRateLimitedRequest = true;
const env = {
  PRIVATE_API_LIMITER: {
    async limit({ key }) {
      privateLimiterCalls++;
      assert.match(key, /^\/v1\/(scenarios|billing\/checkout|billing\/status|billing\/config|billing\/cancel):/);
      return { success: allowPrivateRateLimitedRequest };
    }
  },
  PUBLIC_API_LIMITER: {
    async limit({ key }) {
      limiterCalls++;
      assert.match(key, /^\/v1\/(calculate|india-tax|fx):/);
      return { success: allowRateLimitedRequest };
    }
  },
  ASSETS: {
    async fetch(request) {
      assetCalls.push(new URL(request.url).pathname);
      return new Response("static asset", { status: 200, headers: { "Content-Type": "text/plain" } });
    }
  }
};
const modelsResponse = await worker.fetch(new Request("https://example.test/v1/models"), env, {});
assert.equal(modelsResponse.status, 200);
const modelData = await modelsResponse.json();
assert.ok(modelData.models.some(model => model.id === "sip" && model.version === "1.0.0"));
const registryCount = JSON.parse(fs.readFileSync("calculator-definitions/registry.json", "utf8")).count;
assert.equal(modelData.models.length, registryCount, "API must expose every registered calculator model");
const calculate = await worker.fetch(new Request("https://example.test/v1/calculate", {
  method: "POST", headers: { "Content-Type": "application/json", "cf-connecting-ip": "203.0.113.10" },
  body: JSON.stringify({ model: "sip", inputs: { monthly: 5000, annualRate: 10, years: 10 } })
}), env, {});
assert.equal(calculate.status, 200);
assert.equal(limiterCalls, 1, "Public calculation requests must pass through the rate limiter");
allowRateLimitedRequest = false;
const throttled = await worker.fetch(new Request("https://example.test/v1/calculate", {
  method: "POST", headers: { "Content-Type": "application/json", "cf-connecting-ip": "203.0.113.10" },
  body: JSON.stringify({ model: "sip", inputs: { monthly: 5000, annualRate: 10, years: 10 } })
}), env, {});
assert.equal(throttled.status, 429);
assert.equal(throttled.headers.get("Retry-After"), "60");
allowRateLimitedRequest = true;
const missingLimiter = await worker.fetch(new Request("https://example.test/v1/calculate", {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ model: "sip", inputs: { monthly: 5000, annualRate: 10, years: 10 } })
}), { ASSETS: env.ASSETS }, {});
assert.equal(missingLimiter.status, 503, "Public calculation API must fail closed if rate limiting is unconfigured");
const authConfig = await worker.fetch(new Request("https://example.test/v1/auth-config"), env, {});
assert.equal(authConfig.status, 503, "Account config must fail closed until credentials are set");
const unknown = await worker.fetch(new Request("https://example.test/v1/does-not-exist"), env, {});
assert.equal(unknown.status, 404);
assert.equal((await unknown.json()).error.code, "NOT_FOUND");
const wrongMethod = await worker.fetch(new Request("https://example.test/v1/calculate"), env, {});
assert.equal(wrongMethod.status, 405);
const unauthenticated = await worker.fetch(new Request("https://example.test/v1/scenarios"), env, {});
assert.equal(unauthenticated.status, 401);
assert.equal(privateLimiterCalls, 1, "Private scenario requests must pass through their dedicated limiter");
allowPrivateRateLimitedRequest = false;
const privateThrottled = await worker.fetch(new Request("https://example.test/v1/scenarios", { headers: { Origin: "https://wealtharrays.com" } }), { ...env, ALLOWED_ORIGINS: "https://wealtharrays.com" }, {});
assert.equal(privateThrottled.status, 429);
assert.equal(privateThrottled.headers.get("Retry-After"), "60");
assert.equal(privateThrottled.headers.get("Access-Control-Allow-Origin"), "https://wealtharrays.com");
allowPrivateRateLimitedRequest = true;
const missingPrivateLimiter = await worker.fetch(new Request("https://example.test/v1/scenarios"), { PUBLIC_API_LIMITER: env.PUBLIC_API_LIMITER, ASSETS: env.ASSETS }, {});
assert.equal(missingPrivateLimiter.status, 503, "Private APIs must fail closed when their limiter is missing");
const staticResponse = await worker.fetch(new Request("https://example.test/index.html"), env, {});
assert.equal(await staticResponse.text(), "static asset");
assert.deepEqual(assetCalls, ["/index.html"]);
console.log("Cloudflare Worker API routing and static-asset fallback tests passed.");


// Health endpoint checks D1 and Supabase without returning credentials or project URLs.
const originalFetch = globalThis.fetch;
let healthFetchUrl = '';
globalThis.fetch = async (url, init) => {
  healthFetchUrl = String(url);
  assert.equal(init?.headers?.apikey, 'health-test-anon-key');
  return new Response('ok', { status: 200 });
};
try {
  const healthResponse = await worker.fetch(new Request('https://example.test/v1/health'), {
    DB: { prepare(sql) { assert.equal(sql, 'SELECT 1 AS ok'); return { async first() { return { ok: 1 }; } }; } },
    SUPABASE_URL: 'https://health-test.supabase.co', SUPABASE_ANON_KEY: 'health-test-anon-key', ASSETS: env.ASSETS
  }, {});
  assert.equal(healthResponse.status, 200);
  const healthBody = await healthResponse.json();
  assert.equal(healthBody.status, 'ok'); assert.equal(healthBody.version, '1.0.0');
  assert.equal(healthBody.checks.d1.status, 'ok'); assert.equal(healthBody.checks.supabase.status, 'ok');
  assert.equal(healthFetchUrl, 'https://health-test.supabase.co/auth/v1/health');
  assert.doesNotMatch(JSON.stringify(healthBody), /health-test-anon-key|health-test\\.supabase\\.co/);
  const degraded = await worker.fetch(new Request('https://example.test/v1/health'), { ASSETS: env.ASSETS }, {});
  assert.equal(degraded.status, 503);
  const degradedBody = await degraded.json();
  assert.equal(degradedBody.status, 'degraded');
  assert.equal(degradedBody.checks.d1.status, 'not_configured');
  assert.equal(degradedBody.checks.supabase.status, 'not_configured');
} finally { globalThis.fetch = originalFetch; }

const deniedOrigin = await worker.fetch(new Request('https://example.test/v1/scenarios', { headers: { Origin: 'https://evil.example' } }), { ...env, ALLOWED_ORIGINS: 'https://wealtharrays.com' }, {});
assert.equal(deniedOrigin.status, 403);
assert.equal(deniedOrigin.headers.get('Access-Control-Allow-Origin'), null);
const allowedOrigin = await worker.fetch(new Request('https://example.test/v1/scenarios', { headers: { Origin: 'https://wealtharrays.com' } }), { ...env, ALLOWED_ORIGINS: 'https://wealtharrays.com' }, {});
assert.equal(allowedOrigin.status, 401);
assert.equal(allowedOrigin.headers.get('Access-Control-Allow-Origin'), 'https://wealtharrays.com');
