# Backend setup guide — owner-controlled TEST environment

**Status:** owner action required. This guide does not authorize production activation, live billing, migrations against production data, or public commercial launch. Keep billing disabled until the owner explicitly approves live activation in writing.

The existing root-level [SAAS_SETUP.md](../../SAAS_SETUP.md) is the detailed technical reference. This guide is the safe execution checklist and records the boundary between code readiness and owner-side configuration.

## 0. Before touching provider dashboards

- Use separate TEST/staging projects and credentials wherever the provider supports them.
- Do not paste credentials, tokens, webhook secrets, database IDs or customer data into ChatGPT, issues, PRs, source files or docs.
- Add secrets only through the authorized GitHub Actions repository/environment secret UI. The repository needs secret names only.
- Restrict access to the smallest set of owner-controlled accounts. Enable MFA.
- Confirm the exact Cloudflare Pages production branch, build command and output directory before changing deployment settings.
- Export/backup any existing database before migrations. Never test migrations on production data.

## 1. Cloudflare Worker and D1

Owner actions:
1. Create a dedicated TEST D1 database and record its database ID privately.
2. Review every file in migrations/ and confirm the migration order and target database before running the deployment workflow.
3. Create a least-privilege Cloudflare API token limited to the required account, Worker, D1 and deployment operations.
4. Add these names to the appropriate GitHub Actions environment/repository secret store; values remain private:
   - CLOUDFLARE_API_TOKEN
   - CLOUDFLARE_ACCOUNT_ID
   - CLOUDFLARE_D1_DATABASE_ID
5. Confirm the Worker route and binding in wrangler.toml. The Worker serves /v1/*; Pages remains a separate static-site deployment.
6. Deploy only to the TEST environment first. Verify GET /v1/health, GET /v1/models and rate-limit behaviour. Confirm missing bindings fail closed.

Do not create a production D1 database or run production migrations as part of this checklist.

## 2. Supabase TEST authentication

1. Create a separate TEST project.
2. Enable only the intended sign-in method and configure the exact TEST redirect URLs.
3. Add SUPABASE_URL and SUPABASE_ANON_KEY to the TEST GitHub Actions environment. The anon/publishable key is public by design; never use a service-role key in browser code.
4. Verify sign-in, sign-out, expired session, invalid token, and cross-user scenario isolation.
5. Confirm local/browser scenarios still work without signup and that cloud sync happens only after an explicit user action.

## 3. Razorpay TEST mode — no live checkout

1. Create test-mode plans only. Do not create or activate live plans.
2. Add test-mode values under the TEST environment only:
   - RAZORPAY_KEY_ID
   - RAZORPAY_KEY_SECRET
   - RAZORPAY_PLAN_MONTHLY
   - RAZORPAY_PLAN_YEARLY
   - RAZORPAY_WEBHOOK_SECRET
3. Configure the TEST webhook endpoint and the subscription/payment events documented in SAAS_SETUP.md.
4. Verify signature rejection, duplicate event idempotency, out-of-order events, retries, cancellation, pause/resume, failed payment and refund.
5. Confirm server-side entitlement checks—not browser flags—control paid features.
6. Keep public production checkout disabled. Never switch to live keys or live plans without separate written owner approval after legal/accounting review.

## 4. Required TEST evidence before PR #145 or billing work can be considered

Record run IDs and sanitized outcomes (never secrets or personal/financial payloads):

- [ ] Health endpoint reports expected TEST service readiness.
- [ ] Supported model list and API calculation smoke pass.
- [ ] Authentication lifecycle passes, including expired/invalid session.
- [ ] User A cannot read/update User B's scenarios.
- [ ] Local-first scenario workflow works without signup.
- [ ] D1 migrations apply to TEST in order and backup/restore is rehearsed.
- [ ] Rate limiting and abuse controls are exercised.
- [ ] Webhook HMAC verification and idempotency pass.
- [ ] Subscription lifecycle and entitlement reconciliation pass.
- [ ] Error/health alerts are delivered and recovery closes/deduplicates alerts.
- [ ] Privacy audit confirms financial inputs/outputs do not enter analytics or logs.
- [ ] Deployment rollback procedure is rehearsed.

A green unit test or Worker build is not a substitute for these external TEST lifecycle checks.

## 5. Production activation gate

Production remains disabled until all are true:
- Owner gives explicit written approval for the specific activation.
- TEST lifecycle evidence is complete and reviewed.
- CA/legal review confirms applicable GST, income-tax, consumer, privacy/DPDP, payment and refund obligations.
- Security, access control, backups, retention, incident response and monitoring are reviewed.
- Pricing, plan terms, cancellation/refund UX and support process are approved.
- Production secrets are created directly by the owner in provider dashboards, never shared in chat or committed.
- A controlled production release and post-deploy L1-L3 verification plan is approved.

No CA/legal sign-off or production provider configuration is claimed by this guide.
