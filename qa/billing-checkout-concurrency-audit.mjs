import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("functions/v1/billing/checkout.js", "utf8")
  .replace(/^import \{ authenticate, ensureProfile \} from "\.\.\/\_auth\.js";\n/, "const authenticate = async () => ({ user: { id: 'user_1', email: 'test@example.invalid' } }); const ensureProfile = async () => {};\n")
  .replace(/^import \{ error, json, enforceRateLimit \} from "\.\.\/\_shared\.js";\n/, [
    'const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...extra } });',
    'const error = (code, message, status = 400, details) => json({ error: { code, message, ...(details ? { details } : {}) } }, status, { "Cache-Control": "no-store" });',
    'const enforceRateLimit = async () => null;'
  ].join("\n"))
  .replace("export async function onRequestOptions", "async function onRequestOptions")
  .replace("export async function onRequestPost", "async function onRequestPost")
  + "\nexport { onRequestPost };";
const checkoutModule = await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));

function makeDb({ failSubscriptionInsertOnce = false } = {}) {
  const locks = new Map();
  const subscriptions = new Map();
  let failInsert = failSubscriptionInsertOnce;
  return {
    locks, subscriptions,
    prepare(sql) {
      return { bind(...values) {
        return {
          async run() {
            if (sql.startsWith("INSERT OR IGNORE INTO billing_checkout_locks")) {
              const [userId, planId, attemptId] = values;
              if (locks.has(userId)) return { meta: { changes: 0 } };
              locks.set(userId, { user_id: userId, plan_id: planId, attempt_id: attemptId, status: "creating", provider_subscription_id: null });
              return { meta: { changes: 1 } };
            }
            if (sql.startsWith("UPDATE billing_checkout_locks SET provider_subscription_id")) {
              const [providerId, userId, attemptId] = values;
              const lock = locks.get(userId);
              if (lock?.attempt_id === attemptId) {
                lock.provider_subscription_id = providerId;
                lock.status = "reconcile";
                return { meta: { changes: 1 } };
              }
              return { meta: { changes: 0 } };
            }
            if (sql.startsWith("DELETE FROM billing_checkout_locks")) {
              const [userId, attemptId] = values;
              const lock = locks.get(userId);
              if (lock?.attempt_id === attemptId) { locks.delete(userId); return { meta: { changes: 1 } }; }
              return { meta: { changes: 0 } };
            }
            if (sql.startsWith("INSERT OR IGNORE INTO subscriptions")) {
              if (failInsert) { failInsert = false; throw new Error("simulated D1 insert failure"); }
              const [, userId, , providerId, plan, status] = values;
              if (subscriptions.has(providerId)) return { meta: { changes: 0 } };
              subscriptions.set(providerId, { user_id: userId, plan_id: plan, status });
              return { meta: { changes: 1 } };
            }
            throw new Error("Unexpected D1 run: " + sql);
          },
          async first() {
            if (sql.startsWith("SELECT status, current_period_end FROM subscriptions")) return null;
            if (sql.startsWith("SELECT provider_subscription_id, plan_id, status FROM subscriptions")) return null;
            if (sql.startsWith("SELECT plan_id, attempt_id, status, provider_subscription_id FROM billing_checkout_locks")) return locks.get(values[0]) || null;
            throw new Error("Unexpected D1 first: " + sql);
          }
        };
      }};
    }
  };
}
const envFor = DB => ({ DB, RAZORPAY_KEY_ID: "rzp_test_key", RAZORPAY_KEY_SECRET: "test_secret", RAZORPAY_PLAN_MONTHLY: "plan_month", RAZORPAY_PLAN_YEARLY: "plan_year" });
const request = () => new Request("https://example.test/v1/billing/checkout", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer test" }, body: JSON.stringify({ plan: "monthly" }) });

const originalFetch = globalThis.fetch;
try {
  // Two simultaneous requests for the same user must result in at most one
  // remote POST. The second request sees the D1 lock while the first is in flight.
  const concurrentDb = makeDb();
  let providerCreates = 0;
  globalThis.fetch = async (url, options = {}) => {
    if (options.method === "POST") {
      providerCreates++;
      await new Promise(resolve => setTimeout(resolve, 20));
      return new Response(JSON.stringify({ id: "sub_concurrent", short_url: "https://rzp.test/checkout", status: "created" }), { status: 200 });
    }
    throw new Error("Unexpected provider GET");
  };
  const concurrentResults = await Promise.all([
    checkoutModule.onRequestPost({ request: request(), env: envFor(concurrentDb) }),
    checkoutModule.onRequestPost({ request: request(), env: envFor(concurrentDb) })
  ]);
  assert.equal(providerCreates, 1, "Only one Razorpay subscription POST may occur for concurrent same-user checkouts");
  assert.deepEqual(concurrentResults.map(x => x.status).sort(), [201, 409]);
  assert.equal(concurrentDb.subscriptions.size, 1);
  assert.equal(concurrentDb.locks.size, 0);

  // If the provider succeeded but the local insert failed, keep the provider id
  // in the lock and recover the same subscription on retry; never POST again.
  const recoveryDb = makeDb({ failSubscriptionInsertOnce: true });
  let recoveryCreates = 0;
  globalThis.fetch = async (url, options = {}) => {
    if (options.method === "POST") {
      recoveryCreates++;
      return new Response(JSON.stringify({ id: "sub_recover", short_url: "https://rzp.test/recover", status: "created" }), { status: 200 });
    }
    return new Response(JSON.stringify({ id: "sub_recover", short_url: "https://rzp.test/recover", status: "created" }), { status: 200 });
  };
  const first = await checkoutModule.onRequestPost({ request: request(), env: envFor(recoveryDb) });
  assert.equal(first.status, 500);
  assert.equal(recoveryDb.locks.get("user_1")?.provider_subscription_id, "sub_recover");
  const retry = await checkoutModule.onRequestPost({ request: request(), env: envFor(recoveryDb) });
  assert.equal(retry.status, 200);
  assert.equal(recoveryCreates, 1, "Retry must fetch and reuse the prior provider subscription, not create another");
  assert.equal(recoveryDb.subscriptions.size, 1);
  assert.equal(recoveryDb.locks.size, 0);

  // An unknown provider outcome must keep the lock and fail closed.
  const uncertainDb = makeDb();
  globalThis.fetch = async () => { throw new Error("simulated network timeout"); };
  const uncertain = await checkoutModule.onRequestPost({ request: request(), env: envFor(uncertainDb) });
  assert.equal(uncertain.status, 409);
  assert.equal(uncertainDb.locks.size, 1);
  globalThis.fetch = async () => { throw new Error("must not create again"); };
  const blockedRetry = await checkoutModule.onRequestPost({ request: request(), env: envFor(uncertainDb) });
  assert.equal(blockedRetry.status, 409);
  assert.equal(uncertainDb.locks.size, 1);

  console.log("Razorpay checkout concurrency audit PASS: one provider create, provider-id recovery, and fail-closed ambiguous timeout.");
} finally {
  globalThis.fetch = originalFetch;
}
