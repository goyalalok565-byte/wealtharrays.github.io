import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("functions/v1/_entitlements.js", "utf8");
const moduleSource = source.replace(/^export /gm, "");
const mod = await import("data:text/javascript;base64," + Buffer.from(moduleSource + "\nexport { FREE_SCENARIO_LIMIT, MAX_SCENARIO_LIMIT, resolveEntitlement };").toString("base64"));

assert.equal(mod.FREE_SCENARIO_LIMIT, 3);
assert.equal(mod.MAX_SCENARIO_LIMIT, 500);
assert.deepEqual(mod.resolveEntitlement(null), {
  tier: "free", active: false, plan_id: null, cloud_scenario_limit: 3,
  features: { cloud_scenario_sync: true, cross_device_scenarios: true, expanded_scenario_library: false }
});
assert.equal(mod.resolveEntitlement({ status: "active", plan_id: "monthly" }).tier, "pro");
assert.equal(mod.resolveEntitlement({ status: "active", plan_id: "yearly", current_period_end: "2027-01-01T00:00:00.000Z" }, Date.parse("2026-11-18T00:00:00.000Z")).tier, "pro");
assert.equal(mod.resolveEntitlement({ status: "active", plan_id: "yearly", current_period_end: "2026-11-17T00:00:00.000Z" }, Date.parse("2026-11-18T00:00:00.000Z")).tier, "free");
assert.equal(mod.resolveEntitlement({ status: "cancelled", plan_id: "monthly" }).tier, "free");
assert.equal(mod.resolveEntitlement({ status: "halted", plan_id: "monthly" }).tier, "free");
assert.equal(mod.resolveEntitlement({ status: "active", plan_id: "monthly", current_period_end: "not-a-date" }).tier, "free");

const scenarios = fs.readFileSync("functions/v1/scenarios.js", "utf8");
assert.match(scenarios, /getEntitlement\(env, auth\.user\.id\)/);
assert.match(scenarios, /FREE_PLAN_LIMIT_REACHED/);
assert.match(scenarios, /used >= entitlement\.cloud_scenario_limit/);
assert.match(scenarios, /COUNT\(\*\) AS total/);\nassert.match(scenarios, /INSERT INTO saved_scenarios[\\s\\S]*SELECT[\\s\\S]*WHERE \\(SELECT COUNT\\(\\*\\) FROM saved_scenarios/);
const worker = fs.readFileSync("worker.mjs", "utf8");
assert.match(worker, /billing\/config/);
const account = fs.readFileSync("account.js", "utf8");
assert.match(account, /v1\/billing\/config/);
assert.match(account, /cloud_scenario_limit/);
console.log("SaaS entitlement audit PASS — free quota, active/expired/cancelled states, server enforcement and UI readiness.");
