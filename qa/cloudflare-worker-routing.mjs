import assert from "node:assert/strict";
import worker from "../worker.mjs";

const assetCalls = [];
const env = {
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
