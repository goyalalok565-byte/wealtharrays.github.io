import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("functions/v1/_entitlements.js", "utf8");
const moduleSource = source.replace(/^export /gm, "");
const mod = await import("data:text/javascript;base64," + Buffer.from(moduleSource + "\nexport { FREE_SCENARIO_LIMIT, MAX_SCENARIO_LIMIT, resolveEntitlement };").toString("base64"));

assert.equal(mod.FREE_SCENARIO_LIMIT, 3);
assert.equal(mod.MAX_SCENARIO_LIMIT, 500);
assert.deepEqual(mod.resolveEntitlement(null), {
  tier: "free", active: false, source: null, plan_id: null, cloud_scenario_limit: 3,
  trial: { status: "available", ends_at: null },
  features: { cloud_scenario_sync: true, cross_device_scenarios: true, expanded_scenario_library: false }
});
assert.equal(mod.resolveEntitlement({ status: "active", plan_id: "monthly" }).tier, "free", "An active subscription without a billing-period end must fail closed.");
assert.equal(mod.resolveEntitlement({ status: "active", plan_id: "monthly", current_period_end: null }).tier, "free", "A null provider period end must not grant indefinite Pro access.");
assert.equal(mod.resolveEntitlement({ status: "active", plan_id: "yearly", current_period_end: "2027-01-01T00:00:00.000Z" }, Date.parse("2026-11-18T00:00:00.000Z")).tier, "pro");
assert.equal(mod.resolveEntitlement({ status: "active", plan_id: "yearly", current_period_end: "2026-11-17T00:00:00.000Z" }, Date.parse("2026-11-18T00:00:00.000Z")).tier, "free");
assert.equal(mod.resolveEntitlement({ status: "cancelled", plan_id: "monthly" }).tier, "free");
assert.equal(mod.resolveEntitlement({ status: "halted", plan_id: "monthly" }).tier, "free");
assert.equal(mod.resolveEntitlement({ status: "active", plan_id: "monthly", current_period_end: "not-a-date" }).tier, "free");
assert.equal(mod.resolveEntitlement(null, Date.parse("2026-11-20T00:00:00.000Z"), { ends_at: "2026-12-04T00:00:00.000Z" }).tier, "pro");
assert.equal(mod.resolveEntitlement(null, Date.parse("2026-11-20T00:00:00.000Z"), { ends_at: "2026-12-04T00:00:00.000Z" }).source, "trial");
assert.equal(mod.resolveEntitlement({ status: "active", plan_id: "monthly" }, Date.parse("2026-11-20T00:00:00.000Z"), { ends_at: "2026-12-04T00:00:00.000Z" }).source, "trial", "A valid trial may grant access when a paid record is incomplete.");
assert.equal(mod.resolveEntitlement(null, Date.parse("2026-12-05T00:00:00.000Z"), { ends_at: "2026-12-04T00:00:00.000Z" }).tier, "free");
assert.equal(mod.resolveEntitlement(null, Date.parse("2026-12-05T00:00:00.000Z"), { ends_at: "2026-12-04T00:00:00.000Z" }).trial.status, "expired");

const scenarios = fs.readFileSync("functions/v1/scenarios.js", "utf8");
assert.match(scenarios, /getEntitlement\(env, auth\.user\.id\)/);
assert.match(scenarios, /FREE_PLAN_LIMIT_REACHED/);
assert.match(scenarios, /used >= entitlement\.cloud_scenario_limit/);
assert.match(scenarios, /COUNT\(\*\) AS total/);
assert.match(scenarios, /INSERT INTO saved_scenarios[\s\S]*SELECT[\s\S]*WHERE \(SELECT COUNT\(\*\) FROM saved_scenarios/);
const cancel = fs.readFileSync("functions/v1/billing/cancel.js", "utf8");
assert.match(cancel, /SELECT provider_subscription_id, plan_id, status, current_period_end, cancel_at_period_end FROM subscriptions/);
assert.match(cancel, /current_period_end: result\.current_end \? new Date\(result\.current_end \* 1000\)\.toISOString\(\) : current\.current_period_end \|\| null/,
  "Cancellation API must return the preserved period end when Razorpay omits current_end.");
assert.match(cancel, /current_period_end = COALESCE\(\?, current_period_end\)/,
  "A provider response without current_end must preserve the known billing-period end during scheduled cancellation.");

const worker = fs.readFileSync("worker.mjs", "utf8");
assert.match(worker, /billing\/config/);
const account = fs.readFileSync("account.js", "utf8");
const auth = fs.readFileSync("functions/v1/_auth.js", "utf8");
assert.match(auth, /email_verified: Boolean\(user\.email_confirmed_at \|\| user\.confirmed_at\)/);
assert.match(account, /v1\/billing\/config/);
assert.match(account, /cloud_scenario_limit/);
console.log("SaaS entitlement audit PASS — paid access expiry, trial fallback, free quota, server enforcement and UI readiness.");
