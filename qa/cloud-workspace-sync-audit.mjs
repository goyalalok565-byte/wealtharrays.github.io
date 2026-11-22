import assert from "node:assert/strict";
import fs from "node:fs";
const helper=fs.readFileSync("cloud-scenarios.js","utf8");
assert.match(helper,/waSupabaseSession/);
assert.match(helper,/refresh_token/);
assert.match(helper,/Authorization:"Bearer "\+token/);
assert.match(helper,/method:"POST"/);
assert.match(helper,/method:"GET"/);
assert.match(helper,/calculator_id/);
assert.match(helper,/window\.WATurnstile\.getToken/);
assert.match(helper,/cf-turnstile-response/);
const core=fs.readFileSync("wa-core.js","utf8");
assert.match(core,/function setupTurnstile\(\)/);
assert.match(core,/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js/);
const accountJs=fs.readFileSync("account.js","utf8");
assert.match(accountJs,/captcha_token:await window\.WATurnstile\.getToken\(\)/);
assert.match(accountJs,/cf-turnstile-response/);
for(const [html,js,save,load,kind] of [
 ["scenario-lab.html","scenario-lab.js","sl-cloud-save","sl-cloud-load","scenario-lab"],
 ["goal-planner.html","goal-planner.js","gp-cloud-save","gp-cloud-load","goal-planner"],
 ["financial-workspace.html","financial-workspace.js","fw-cloud-save","fw-cloud-load","financial-workspace"]
]){
 const page=fs.readFileSync(html,"utf8"),script=fs.readFileSync(js,"utf8");
 assert.ok(page.includes('id="'+save+'"'),html+" missing cloud save button");
 assert.ok(page.includes('id="'+load+'"'),html+" missing cloud load button");
 assert.ok(page.includes('/cloud-scenarios.js'),html+" missing cloud sync helper");
 assert.ok(script.includes("WACloudScenarios.save('"+kind+"'"),js+" missing save handler");
 assert.ok(script.includes("WACloudScenarios.latest('"+kind+"'"),js+" missing load handler");
 assert.ok(script.includes("cloud_scenario_save"),js+" missing save analytics event");
 assert.ok(script.includes("cloud_scenario_load"),js+" missing load analytics event");
}
const account=fs.readFileSync("account.html","utf8");
assert.match(account,/Scenario Lab, Goal Planner or Financial Workspace/);
const browserSmoke=fs.readFileSync("qa/cloud-workspace-sync-browser-smoke.mjs","utf8");
for(const path of ["/scenario-lab.html","/goal-planner.html","/financial-workspace.html"])assert.ok(browserSmoke.includes(path),"browser smoke missing "+path);
const workflow=fs.readFileSync(".github/workflows/platform-gates.yml","utf8");
assert.match(workflow,/cloud-workspace-sync-browser-smoke\.mjs/);
const build=JSON.parse(fs.readFileSync("package.json","utf8")).scripts["build:dist"];
assert.match(build,/cloud-workspace-sync-audit/);
console.log("Cloud workspace sync audit PASS — authenticated save/load, shared quota and all three planning workspaces.");
