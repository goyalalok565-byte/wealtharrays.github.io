import assert from "node:assert/strict";
import worker from "../worker.mjs";

const assetCalls = [];
let limiterCalls = 0;
let allowRateLimitedRequest = true;
const env = {
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
const wwwPageRedirect = await worker.fetch(new Request("https://www.wealtharrays.com/sip-calculator/?source=qa"), env, {});
assert.equal(wwwPageRedirect.status, 308);
assert.equal(wwwPageRedirect.headers.get("Location"), "https://wealtharrays.com/sip-calculator/?source=qa");
const wwwWebhookRedirect = await worker.fetch(new Request("https://www.wealtharrays.com/v1/billing/webhook", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: "{}"
}), env, {});
assert.equal(wwwWebhookRedirect.status, 308);
assert.equal(wwwWebhookRedirect.headers.get("Location"), "https://wealtharrays.com/v1/billing/webhook");
const modelsResponse = await worker.fetch(new Request("https://example.test/v1/models"), env, {});
assert.equal(modelsResponse.status, 200);
const modelData = await modelsResponse.json();
assert.ok(modelData.models.some(model => model.id === "sip" && model.version === "1.0.0"));
const healthResponse = await worker.fetch(new Request("https://example.test/v1/health"), {
  ...env,
  DB: { prepare(sql) { assert.equal(sql, "SELECT 1 AS ok"); return { async first() { return { ok: 1 }; } }; } },
  SUPABASE_URL: "https://supabase.example.test",
  SUPABASE_ANON_KEY: "public-anon-test-value",
  RAZORPAY_KEY_ID: "rzp_test_key",
  RAZORPAY_KEY_SECRET: "test-secret-must-not-leak",
  RAZORPAY_PLAN_MONTHLY: "plan_monthly",
  RAZORPAY_PLAN_YEARLY: "plan_yearly",
  RAZORPAY_WEBHOOK_SECRET: "webhook-secret-must-not-leak",
  TURNSTILE_SITE_KEY: "public-turnstile-site-key",
  TURNSTILE_SECRET_KEY: "turnstile-secret-must-not-leak",
  WRITE_API_LIMITER: { async limit() { return { success: true }; } },\n  TURNSTILE_SITE_KEY: "public-turnstile-site-key",\n  TURNSTILE_SECRET_KEY: "turnstile-secret-must-not-leak",\n  WRITE_API_LIMITER: { async limit() { return { success: true }; } }
}, {});
assert.equal(healthResponse.status, 200);
const healthData = await healthResponse.json();
assert.equal(healthData.status, "ok");
assert.equal(healthData.service, "wealth-arrays-api");
assert.equal(healthData.version, "1.0.0");
assert.equal(healthData.dependencies.d1_database, "ok");
assert.equal(healthData.dependencies.supabase_auth, "configured");
assert.equal(healthData.dependencies.razorpay_billing, "configured");
assert.equal(healthData.dependencies.turnstile, "configured");\nassert.equal(healthData.dependencies.write_api_rate_limiter, "configured");\nassert.equal(healthData.dependencies.turnstile, "configured");
assert.equal(healthData.dependencies.write_api_rate_limiter, "configured");
assert.equal(healthData.ready_for_saas, true);
assert.equal(JSON.stringify(healthData).includes("test-secret-must-not-leak"), false);
assert.equal(JSON.stringify(healthData).includes("public-anon-test-value"), false);
assert.equal(JSON.stringify(healthData).includes("turnstile-secret-must-not-leak"), false);\nassert.equal(JSON.stringify(healthData).includes("turnstile-secret-must-not-leak"), false);
const unhealthy = await worker.fetch(new Request("https://example.test/v1/health"), {
  ...env,
  DB: { prepare() { return { async first() { throw new Error("database offline"); } }; } }
}, {});
assert.equal(unhealthy.status, 503);
assert.equal((await unhealthy.json()).status, "degraded");

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
const securityConfig = await worker.fetch(new Request("https://example.test/v1/security-config"), env, {});\nassert.equal(securityConfig.status, 200);\nconst securityData = await securityConfig.json();\nassert.equal(securityData.configured, true);\nassert.equal(securityData.site_key, "public-turnstile-site-key");\nassert.equal(JSON.stringify(securityData).includes("turnstile-secret-must-not-leak"), false);\nconst securityConfig = await worker.fetch(new Request("https://example.test/v1/security-config"), env, {});
assert.equal(securityConfig.status, 200);
const securityData = await securityConfig.json();
assert.equal(securityData.configured, true);
assert.equal(securityData.site_key, "public-turnstile-site-key");
assert.equal(JSON.stringify(securityData).includes("turnstile-secret-must-not-leak"), false);
const authConfig = await worker.fetch(new Request("https://example.test/v1/auth-config"), env, {});
assert.equal(authConfig.status, 503, "Account config must fail closed until credentials are set");
const unknown = await worker.fetch(new Request("https://example.test/v1/does-not-exist"), env, {});
assert.equal(unknown.status, 404);
assert.equal((await unknown.json()).error.code, "NOT_FOUND");
const wrongMethod = await worker.fetch(new Request("https://example.test/v1/calculate"), env, {});
assert.equal(wrongMethod.status, 405);
const unauthenticated = await worker.fetch(new Request("https://example.test/v1/scenarios"), env, {});
assert.equal(unauthenticated.status, 401);
const staticResponse = await worker.fetch(new Request("https://example.test/index.html"), env, {});
assert.equal(await staticResponse.text(), "static asset");
assert.deepEqual(assetCalls, ["/index.html"]);
console.log("Cloudflare Worker API routing and static-asset fallback tests passed.");
