import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("functions/v1/billing/checkout.js", "utf8")
  .replace('import { authenticate, ensureProfile } from "../_auth.js";\n', 'const authenticate = async () => ({ user: globalThis.__checkoutTestUser }); const ensureProfile = async () => {};\n')
  .replace('import { error, json } from "../_shared.js";\n', 'const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...extra } }); const error = (code, message, status = 400, details) => json({ error: { code, message, ...(details ? { details } : {}) } }, status, { "Cache-Control": "no-store" });\n');
const checkoutModule = await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));

const locks = new Map();
const subscriptions = [];
const db = {
  prepare(sql) {
    return { bind(...values) {
      return {
        async first() {
          if (sql.includes("FROM subscriptions")) return null;
          throw new Error("Unexpected D1 first query: " + sql);
        },
        async run() {
          if (sql.startsWith("INSERT OR IGNORE INTO billing_checkout_locks")) {
            const [userId, plan, token] = values;
            if (locks.has(userId)) return { meta: { changes: 0 } };
            locks.set(userId, { plan, token });
            return { meta: { changes: 1 } };
          }
          if (sql.startsWith("INSERT INTO subscriptions")) {
            subscriptions.push(values);
            return { meta: { changes: 1 } };
          }
          if (sql.startsWith("DELETE FROM billing_checkout_locks")) {
            const [userId, token] = values;
            if (locks.get(userId)?.token === token) {
              locks.delete(userId);
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 0 } };
          }
          throw new Error("Unexpected D1 run query: " + sql);
        }
      };
    }};
  }
};

const env = {
  DB: db,
  RAZORPAY_KEY_ID: "test_key_id",
  RAZORPAY_KEY_SECRET: "test_key_secret",
  RAZORPAY_PLAN_MONTHLY: "plan_monthly",
  RAZORPAY_PLAN_YEARLY: "plan_yearly"
};
const originalFetch = globalThis.fetch;
let providerCalls = 0;
globalThis.fetch = async () => {
  providerCalls++;
  await new Promise(resolve => setTimeout(resolve, 10));
  return new Response(JSON.stringify({ id: "sub_test_1", status: "created", short_url: "https://rzp.io/test-checkout" }), { status: 200 });
};
globalThis.__checkoutTestUser = { id: "user_concurrent", email: "buyer@example.com", email_verified: true };
async function checkout() {
  return checkoutModule.onRequestPost({
    request: new Request("https://example.test/v1/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer test" },
      body: JSON.stringify({ plan: "monthly" })
    }),
    env
  });
}
const results = await Promise.all([checkout(), checkout()]);
const statuses = results.map(response => response.status).sort();
assert.deepEqual(statuses, [201, 409]);
assert.equal(providerCalls, 1, "Concurrent checkout requests for one account must create only one provider subscription");
assert.equal(subscriptions.length, 1);
assert.equal(locks.has("user_concurrent"), false, "Successful checkout must release its lock");

globalThis.__checkoutTestUser = { id: "user_uncertain", email: "uncertain@example.com", email_verified: true };
globalThis.fetch = async () => { throw new Error("network interrupted after provider request"); };
const uncertain = await checkout();
assert.equal(uncertain.status, 503);
assert.equal((await uncertain.json()).error.code, "CHECKOUT_RECOVERY_REQUIRED");
assert.equal(locks.has("user_uncertain"), true, "Ambiguous provider outcomes must retain the lock to prevent duplicate charges");
const retry = await checkout();
assert.equal(retry.status, 409);
assert.equal((await retry.json()).error.code, "CHECKOUT_IN_PROGRESS");
globalThis.fetch = originalFetch;
delete globalThis.__checkoutTestUser;
console.log("Razorpay checkout concurrency audit PASS: one provider create per account and fail-closed handling of ambiguous responses.");
