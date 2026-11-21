import assert from "node:assert/strict";
import fs from "node:fs";

const root = fs.existsSync("dist") ? "dist" : ".";
const account = fs.readFileSync(root + "/account.js", "utf8");
const accountHtml = fs.readFileSync(root + "/account.html", "utf8");
const appHtml = fs.readFileSync(root + "/app/index.html", "utf8");
const loadStart = account.indexOf("async function loadReports(){");
const loadEnd = account.indexOf('\n$("account-form").addEventListener', loadStart);
assert.ok(loadStart >= 0 && loadEnd > loadStart, "Account must define the saved-report archive loader.");
const loader = account.slice(loadStart, loadEnd);
for (const label of ["View report", "Download JSON", "Delete", "cloud_report_limit"]) {
  assert.ok(loader.includes(label), "Report archive UI must include: " + label);
}
for (const route of ['/v1/reports', '/v1/reports?id=']) {
  assert.ok(loader.includes(route), "Report archive UI must call the authenticated report endpoint: " + route);
}
assert.ok(loader.includes("textContent=JSON.stringify"), "Untrusted saved report data must be rendered as text, not HTML.");
assert.ok(!loader.includes(".innerHTML"), "Saved report payload must never be inserted as HTML.");
assert.ok(loader.includes("URL.createObjectURL") && loader.includes("link.download"), "Saved reports must be downloadable as JSON.");
assert.ok(loader.includes('method:"DELETE"'), "Saved reports must be deletable by their owner.");
assert.ok(accountHtml.includes('id="account-cloud-reports"'), "Account page must expose the report archive mount.");
assert.ok(appHtml.includes('src="/report-engine.js"'), "My Plan page must load the reproducible report engine.");
assert.ok(appHtml.includes('id="save-report"'), "My Plan page must expose the save-report action.");
console.log("Report archive UI audit PASS — authenticated view, safe rendering, JSON export, owner deletion and quota display.");
