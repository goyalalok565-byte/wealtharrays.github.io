import fs from "node:fs";

const deploy = fs.readFileSync(".github/workflows/cloudflare-worker-deploy.yml", "utf8");
const preflight = fs.readFileSync(".github/workflows/cloudflare-deployment-preflight.yml", "utf8");
const require = (condition, message) => { if (!condition) throw new Error(message); };

require(/workflow_dispatch:\s*\n\s+inputs:\s*\n\s+confirm_production_deploy:/m.test(deploy), "Production deploy must expose an explicit confirmation input.");
require(/default:\s*no/m.test(deploy), "Production deploy confirmation must default to no.");
require(/CONFIRM_PRODUCTION_DEPLOY[^\n]*[\s\S]{0,500}!=\s*\\?"yes\\?"[\s\S]{0,300}exit 1/m.test(deploy), "Production deploy must fail closed unless the confirmation is yes.");
const recovery = deploy.indexOf("Verify D1 Time Travel recovery is available");
const migration = deploy.indexOf("Apply D1 migrations");
require(recovery >= 0 && migration > recovery, "D1 Time Travel recovery check must run before migrations.");
require(/npx wrangler d1 time-travel info wealtharrays-saas/.test(deploy), "Production deploy must inspect D1 Time Travel recovery state.");
require(/test -s migrations\/0004_billing_checkout_lock\.sql/.test(preflight), "Read-only deployment preflight must verify migration 0004 exists.");
console.log("Production deployment safety audit PASS: explicit opt-in, recovery check before migration, and migration 0004 preflight.");
