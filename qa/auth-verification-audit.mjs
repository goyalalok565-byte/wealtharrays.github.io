import assert from "node:assert/strict";
import { authenticate } from "../functions/v1/_auth.js";
const originalFetch = globalThis.fetch;
try {
  globalThis.fetch = async () => new Response(JSON.stringify({
    id: "verified-user", email: "verified@example.test", email_confirmed_at: "2026-11-22T00:00:00Z"
  }), { status: 200, headers: { "Content-Type": "application/json" } });
  const verified = await authenticate(new Request("https://example.test/v1/scenarios", {
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
