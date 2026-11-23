import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("functions/v1/_entitlements.js", "utf8")
  .replace("export function resolveEntitlement", "function resolveEntitlement")
  .replace("export async function getEntitlement", "async function getEntitlement")
  + "\nexport { resolveEntitlement, getEntitlement };";
const { resolveEntitlement, getEntitlement } = await import(
  "data:text/javascript;base64," + Buffer.from(source).toString("base64")
);

const now = Date.parse("2026-11-23T12:00:00.000Z");
const future = "2026-12-23T12:00:00.000Z";
const past = "2026-11-22T12:00:00.000Z";

assert.deepEqual(resolveEntitlement(null, now), {
  tier: "free",
  active: false,
  plan_id: null,
  cloud_scenario_limit: 3,
  features: {
    cloud_scenario_sync: true,
    cross_device_scenarios: true,
    expanded_scenario_library: false
  }
}, "Missing subscription must resolve to Free");

const active = resolveEntitlement({ status: "active", plan_id: "monthly", current_period_end: future }, now);
assert.equal(active.tier, "pro", "An active, unexpired subscription must resolve to Pro");
assert.equal(active.cloud_scenario_limit, 500);
assert.equal(active.features.expanded_scenario_library, true);

assert.equal(
  resolveEntitlement({ status: "active", plan_id: "yearly", current_period_end: past }, now).tier,
  "free",
  "An expired subscription must not retain Pro entitlements"
);
assert.equal(resolveEntitlement({ status: "active", plan_id: "monthly", current_period_end: null }, now).tier, "free", "An active status without a paid-through timestamp must fail closed");
assert.equal(resolveEntitlement({ status: "active", plan_id: "monthly", current_period_end: "not-a-date" }, now).tier, "free", "An invalid paid-through timestamp must fail closed");
for (const status of ["created", "pending", "authenticated", "halted", "paused", "cancelled", "completed", "refunded"]) {
  assert.equal(
    resolveEntitlement({ status, plan_id: "monthly", current_period_end: future }, now).tier,
    "free",
    status + " must not grant Pro entitlements"
  );
}

// Cancellation scheduled at period end retains access only until the paid period expires.
assert.equal(
  resolveEntitlement({ status: "active", plan_id: "monthly", current_period_end: future, cancel_at_period_end: 1 }, now).tier,
  "pro"
);
assert.equal(
  resolveEntitlement({ status: "active", plan_id: "monthly", current_period_end: past, cancel_at_period_end: 1 }, now).tier,
  "free"
);

let capturedSql = "";
const db = {
  prepare(sql) {
    capturedSql = sql;
    return { bind(userId) {
      assert.equal(userId, "user_test_1");
      return { first: async () => ({ plan_id: "monthly", status: "active", current_period_end: future }) };
    }};
  }
};
const fromDb = await getEntitlement({ DB: db }, "user_test_1");
assert.equal(fromDb.tier, "pro");
assert.match(capturedSql, /WHERE user_id = \?/);
assert.match(capturedSql, /ORDER BY updated_at DESC LIMIT 1/);
await assert.rejects(() => getEntitlement({}, "user_test_1"), /D1 database is not configured/);

// Keep the schema contract aligned with every column used by billing and entitlement paths.
const baseMigration = fs.readFileSync("migrations/0001_saas.sql", "utf8");
const cancelMigration = fs.readFileSync("migrations/0002_subscription_cancel_flag.sql", "utf8");
const orderingMigration = fs.readFileSync("migrations/0002_billing_webhook_order.sql", "utf8");
assert.match(baseMigration, /CREATE TABLE IF NOT EXISTS subscriptions/);
assert.match(baseMigration, /current_period_end TEXT/);
assert.match(cancelMigration, /ADD COLUMN cancel_at_period_end INTEGER NOT NULL DEFAULT 0/);
assert.match(orderingMigration, /ADD COLUMN last_provider_event_at INTEGER/);

console.log("Phase 1 entitlement/D1 audit PASS: Free/Pro boundaries, expiry, missing/invalid paid-through timestamps, cancellation period, inactive/refunded statuses, D1 fail-closed and billing migration columns.");
