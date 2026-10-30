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
const modelsResponse = await worker.fetch(new Request("https://example.test/v1/models"), env, {});
assert.equal(modelsResponse.status, 200);
const modelData = await modelsResponse.json();
assert.ok(modelData.models.some(model => model.id === "sip" && model.version === "1.0.0"));
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
const staticResponse = await worker.fetch(new Request("https://example.test/index.html"), env, {});
assert.equal(await staticResponse.text(), "static asset");
assert.deepEqual(assetCalls, ["/index.html"]);
console.log("Cloudflare Worker API routing and static-asset fallback tests passed.");
