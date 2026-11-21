import assert from "node:assert/strict";
import fs from "node:fs";

globalThis.__reportUser = { id: "user_1", email: "one@example.com" };
globalThis.__reportTier = "free";
const rows = new Map();
const source = fs.readFileSync("functions/v1/reports.js", "utf8")
  .replace('import { authenticate, ensureProfile } from "./_auth.js";', 'const authenticate = async () => ({ user: globalThis.__reportUser }); const ensureProfile = async () => {};')
  .replace('import { error, json, CORS_HEADERS } from "./_shared.js";', 'const CORS_HEADERS = {}; const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...extra } }); const error = (code, message, status = 400, details) => json({ error: { code, message, ...(details ? { details } : {}) } }, status, { "Cache-Control": "no-store" });')
  .replace('import { getEntitlement } from "./_entitlements.js";', 'const getEntitlement = async () => ({ tier: globalThis.__reportTier, cloud_report_limit: globalThis.__reportTier === "pro" ? 100 : 1 });')
  .replace("export async function onRequest", "async function onRequest")
  + "\nexport { onRequestGet, onRequestPost, onRequestDelete };";
const module = await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));
const db = {
  prepare(sql) { return { bind(...values) { return {
    async first() {
      if (sql.includes("COUNT(*) AS total FROM saved_reports")) return { total: [...rows.values()].filter(x => x.user_id === values[0]).length };
      if (sql.includes("SELECT report_json, fingerprint, content_sha256 FROM saved_reports")) { const x = rows.get(values[0]); return x?.user_id === values[1] ? { report_json: x.report_json, fingerprint: x.fingerprint, content_sha256: x.content_sha256 } : null; }
      throw new Error("Unexpected first query: " + sql);
    },
    async all() { return { results: [...rows.values()].filter(x => x.user_id === values[0]).map(({id,name,model,model_version,currency,fingerprint,created_at})=>({id,name,model,model_version,currency,fingerprint,created_at})) }; },
    async run() {
      if (sql.startsWith("INSERT INTO saved_reports")) {
        const [id,user_id,name,model,model_version,currency,fingerprint,content_sha256,report_json,quotaUser,limit] = values;
        const used = [...rows.values()].filter(x=>x.user_id===quotaUser).length;
        if (used >= limit) return { meta: { changes: 0 } };
        rows.set(id,{id,user_id,name,model,model_version,currency,fingerprint,content_sha256,report_json,created_at:"2026-11-20T00:00:00.000Z"});
        return { meta: { changes: 1 } };
      }
      if (sql.startsWith("DELETE FROM saved_reports")) { const x=rows.get(values[0]); if(x?.user_id===values[1]){rows.delete(values[0]);return {meta:{changes:1}}} return {meta:{changes:0}}; }
      throw new Error("Unexpected run query: " + sql);
    }
        };
      }
    };
  }
};
const env={DB:db};
const report={schemaVersion:"1.0",generatedAt:"2026-11-20T00:00:00.000Z",model:"Financial Workspace",modelVersion:"1.0",currency:"INR",inputs:{startingAmount:1000},assumptions:{deterministic:true},scenarios:[],stressTests:[],sources:[],limitations:["Educational estimate only."]};
function fingerprint(value){const stable={...value};delete stable.generatedAt;const s=JSON.stringify(stable);let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(16).padStart(8,"0");}
async function post(userId,name="Plan") { return module.onRequestPost({request:new Request("https://example.test/v1/reports",{method:"POST",body:JSON.stringify({name,fingerprint:fingerprint(report),report})}),env}); }
let response=await post("user_1");
assert.equal(response.status,201);
const saved=await response.json();
assert.equal(saved.entitlement.cloud_report_limit,1);
response=await post("user_1","Second");
assert.equal(response.status,403);
assert.equal((await response.json()).error.code,"FREE_REPORT_LIMIT_REACHED");
response=await module.onRequestGet({request:new Request("https://example.test/v1/reports"),env});
assert.equal(response.status,200);
assert.equal((await response.json()).reports.length,1);
response=await module.onRequestGet({request:new Request("https://example.test/v1/reports?id="+saved.id),env});
assert.equal(response.status,200);
assert.equal((await response.json()).report.model,"Financial Workspace");
globalThis.__reportUser={id:"user_2",email:"two@example.com"};
response=await module.onRequestGet({request:new Request("https://example.test/v1/reports?id="+saved.id),env});
assert.equal(response.status,404,"A report must never be readable by another account.");
response=await module.onRequestDelete({request:new Request("https://example.test/v1/reports?id="+saved.id),env});
assert.equal(response.status,404,"A report must never be deletable by another account.");
globalThis.__reportUser={id:"user_1",email:"one@example.com"};
response=await module.onRequestDelete({request:new Request("https://example.test/v1/reports?id="+saved.id),env});
assert.equal(response.status,200);
globalThis.__reportTier="pro";
globalThis.__reportUser={id:"pro_user",email:"pro@example.com"};
for(let i=0;i<2;i++){response=await post("pro_user","Pro "+i);assert.equal(response.status,201);}
response=await module.onRequestPost({request:new Request("https://example.test/v1/reports",{method:"POST",body:JSON.stringify({name:"bad",fingerprint:"a1b2c3d4",report})}),env});
assert.equal(response.status,400);
const tooLarge="x".repeat(65537);
response=await module.onRequestPost({request:new Request("https://example.test/v1/reports",{method:"POST",body:tooLarge}),env});
assert.equal(response.status,413);
delete globalThis.__reportUser; delete globalThis.__reportTier;
console.log("Report archive audit PASS — free/pro quotas, payload contract, owner-only access, deletion and size guards.");
