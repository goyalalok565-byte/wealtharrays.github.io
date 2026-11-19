# Manual operations and repository protection

## Branch protection for main

GitHub repository settings cannot be changed by the connected repository file API. Enable the ruleset manually:

1. Open Settings → Rules → Rulesets → New branch ruleset.
2. Target branch: main. Enforcement: Active.
3. Require a pull request before merging. For a solo-maintained repository, use zero required approvals initially; the required checks still gate merges.
4. Require these status checks after they have appeared on a recent PR: canonical (Wealth Arrays Canonical CI), platform (Wealth Arrays Platform Gates), lighthouse (Mobile Lighthouse Quality Gate).
5. Require branches to be up to date, require conversation resolution, block force pushes and block branch deletion.
6. Do not allow routine bypasses.

Important: the current canonical workflow has an automated generated-file commit on main. Before enabling a no-bypass ruleset, refactor that workflow to open/update a generated-artifacts PR instead of pushing directly to main. Otherwise the automation's push can be rejected by branch protection. Do not add a broad bypass just to hide this design issue.

## Legacy branch Main

GitHub's commit comparison shows main is 12 commits ahead of Main and Main has zero unique commits relative to main. It is safe to delete from a Git-history perspective. Before deleting, confirm Cloudflare Pages production and preview deployments both use main, not Main. Cloudflare's dashboard configuration was not accessible in this audit, so deletion was not performed.

## Deployment secrets

Add values only under Repository Settings → Secrets and variables → Actions. The current Worker deployment workflow references:
- CLOUDFLARE_API_TOKEN
- CLOUDFLARE_ACCOUNT_ID
- CLOUDFLARE_D1_DATABASE_ID
- SUPABASE_URL
- SUPABASE_ANON_KEY
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- RAZORPAY_PLAN_MONTHLY
- RAZORPAY_PLAN_YEARLY
- RAZORPAY_WEBHOOK_SECRET

Do not paste credentials into chat, issues, pull requests or source code. The workflow must be re-run after configuring secrets. The Pages build output is dist/; wrangler.toml points Worker assets at ./dist.

## GSC and GA4

The GSC Wizard connector currently refuses property queries because its subscription is not active. Activate the connector and authorize the correct Search Console and GA4 properties. No GSC/GA4 secret names are currently consumed by a repository workflow; implement and document that integration before creating secrets.
