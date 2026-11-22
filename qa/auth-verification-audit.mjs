import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("functions/v1/_auth.js", "utf8")
  .replace(/^import \{ error \} from "\.\/\_shared\.js";\n/, 'const error = (code, message, status = 400) => new Response(JSON.stringify({ error: { code, message } }), { status });')
  .replace("export async function authenticate", "async function authenticate")
  .replace("export async function ensureProfile", "async function ensureProfile")
  + "\nexport { authenticate, ensureProfile };";
const authModule = await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));
const originalFetch = globalThis.fetch;
try {
  globalThis.fetch = async () => new Response(JSON.stringify({
    id: "verified-user", email: "verified@example.test", email_confirmed_at: "2026-11-22T00:00:00Z"
  }), { status: 200, headers: { "Content-Type": "application/json" } });
  const verified = await authModule.authenticate(new Request("https://example.test/v1/scenarios", {
    headers: { Authorization: "Bearer test-access-token" }
  }), { SUPABASE_URL: "https://auth.example.test", SUPABASE_ANON_KEY: "public-test-key" });
  assert.equal(verified.user.id, "verified-user");
  assert.equal(verified.user.email_verified, true);

  globalThis.fetch = async () => new Response(JSON.stringify({
    id: "unverified-user", email: "unverified@example.test", email_confirmed_at: null, confirmed_at: null
  }), { status: 200, headers: { "Content-Type": "application/json" } });
  const unverified = await authModule.authenticate(new Request("https://example.test/v1/scenarios", {
    headers: { Authorization: "Bearer test-access-token" }
  }), { SUPABASE_URL: "https://auth.example.test", SUPABASE_ANON_KEY: "public-test-key" });
  assert.equal(unverified.response.status, 403);
  assert.equal((await unverified.response.json()).error.code, "EMAIL_VERIFICATION_REQUIRED");

  const missingToken = await authModule.authenticate(new Request("https://example.test/v1/scenarios"), {
    SUPABASE_URL: "https://auth.example.test", SUPABASE_ANON_KEY: "public-test-key"
  });
  assert.equal(missingToken.response.status, 401);
} finally {
  globalThis.fetch = originalFetch;
}
console.log("Verified-email authentication audit PASS.");
