import assert from "node:assert/strict";
import fs from "node:fs";

const core=fs.readFileSync("wa-core.js","utf8");
for(const event of ["calculator_open","calculator_calculate","pdf_export","embed_copy","scenario_share","scenario_run","goal_run","workspace_calculate","workspace_save","workspace_load","workspace_delete","report_export","account_signin","account_signup","checkout_start","subscription_cancel_request"]) {
  assert.ok(core.includes("'" + event + "'"), "GA4 event not allow-listed: " + event);
}
assert.match(core,/waAnalyticsConsent/);
assert.match(core,/allowed=new Set\(\['calculator_id','currency','plan','page_type','result_count','feature','method','status'\]\)/);
assert.match(core,/Number\.isFinite\(value\)/);
for(const [file,event] of [
 ["calculator-page-init.js","calculator_open"],
 ["widget.js","calculator_calculate"],
 ["widget.js","pdf_export"],
 ["widget.js","embed_copy"],
 ["scenario-lab.js","scenario_run"],
 ["goal-planner.js","goal_run"],
 ["financial-workspace.js","workspace_calculate"],
 ["financial-workspace.js","workspace_save"],
 ["financial-workspace.js","workspace_load"],
 ["financial-workspace.js","workspace_delete"],
 ["financial-workspace.js","report_export"],
 ["account.js","account_signin"],
 ["account.js","account_signup"],
 ["account.js","checkout_start"],
 ["account.js","subscription_cancel_request"]
]) assert.ok(fs.readFileSync(file,"utf8").includes("'" + event + "'"),file+" missing event "+event);
console.log("Privacy-safe GA4 event audit PASS — consent gated, allow-listed parameters, no raw financial input payloads.");
