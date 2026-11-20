import assert from "node:assert/strict";
import fs from "node:fs";

const byUser = new Map();
const byEmail = new Map();
  .replace("import { authenticate, ensureProfile } from \"../_auth.js\";\n", "const authenticate = async () => ({ user: globalThis.__trialTestUser }); const ensureProfile = async () => {};\n")
  .replace("import { error, json, CORS_HEADERS } from \"../_shared.js\";\n", "const CORS_HEADERS = {}; const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), { status, headers: { \"Content-Type\": \"application/json\", ...extra } }); const error = (code, message, status = 400) => json({ error: { code, message } }, status, { \"Cache-Control\": \"no-store\" });\n")
  .replace("import { getEntitlement } from \"../_entitlements.js\";\n", "const getEntitlement = async (env, userId) => { const row = globalThis.__trialRows.get(userId); const active = Boolean(row && Date.parse(row.ends_at) > Date.now()); return { tier: active ? \"pro\" : \"free\", source: active ? \"trial\" : null, trial: { status: !row ? \"available\" : active ? \"active\" : \"expired\", ends_at: row?.ends_at || null } }; };\n");
  .replace(/^import \\{ error, json, CORS_HEADERS \\} from "\\.\\.\\/_shared\\.js";\\n/, "const CORS_HEADERS = {}; const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...extra } }); const error = (code, message, status = 400) => json({ error: { code, message } }, status, { 'Cache-Control': 'no-store' });\\n")
  .replace(/^import \\{ getEntitlement \\} from "\\.\\.\\/_entitlements\\.js";\\n/, "const getEntitlement = async (env, userId) => { const row = globalThis.__trialRows.get(userId); const active = Boolean(row && Date.parse(row.ends_at) > Date.now()); return { tier: active ? 'pro' : 'free', source: active ? 'trial' : null, trial: { status: !row ? 'available' : active ? 'active' : 'expired', ends_at: row?.ends_at || null } }; };\\n");
const trialModule = await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));

const db = {
  prepare(sql) {
    return { bind(...values) {
      return {
        async first() {
          if (sql.includes("FROM subscriptions")) return null;
          if (sql.includes("FROM pro_trials")) return byUser.get(values[0]) || null;
          throw new Error("Unexpected D1 first query: " + sql);
        },
        async run() {
          if (sql.startsWith("INSERT OR IGNORE INTO pro_trials")) {
            const [id, userId, emailHash, startedAt, endsAt] = values;
            if (byUser.has(userId) || byEmail.has(emailHash)) return { meta: { changes: 0 } };
            const row = { id, user_id: userId, email_hash: emailHash, started_at: startedAt, ends_at: endsAt };
            byUser.set(userId, row);
            byEmail.set(emailHash, row);
            return { meta: { changes: 1 } };
          }
          throw new Error("Unexpected D1 run query: " + sql);
        }
      };
    }};
  }
};
const env = { DB: db };
async function start(user) {
  globalThis.__trialTestUser = user;
  return trialModule.onRequestPost({
    request: new Request("https://example.test/v1/billing/trial", { method: "POST", body: "{}" }),
    env
  });
}
let response = await start({ id: "unverified", email: "person@example.com", email_verified: false });
assert.equal(response.status, 403);
assert.equal((await response.json()).error.code, "EMAIL_VERIFICATION_REQUIRED");
assert.equal(byUser.size, 0);

response = await start({ id: "user_1", email: "Person@Example.com", email_verified: true });
assert.equal(response.status, 201);
const payload = await response.json();
assert.equal(payload.trial_started, true);
assert.equal(payload.trial_days, 14);
assert.equal(payload.entitlement.tier, "pro");
assert.equal(payload.entitlement.source, "trial");
assert.equal(Date.parse(payload.ends_at) - Date.parse(payload.started_at), 14 * 24 * 60 * 60 * 1000);

response = await start({ id: "user_1", email: "person@example.com", email_verified: true });
assert.equal(response.status, 409);
assert.equal((await response.json()).error.code, "TRIAL_ALREADY_CLAIMED");

response = await start({ id: "user_2", email: "PERSON@example.com", email_verified: true });
assert.equal(response.status, 409, "A second account using the same normalized verified email must not receive another trial");
assert.equal(byUser.size, 1);
delete globalThis.__trialTestUser;
delete globalThis.__trialRows;
console.log("Pro trial audit PASS: verified-email gate, 14-day duration, one-time account/email claim and server-side Pro entitlement.");
