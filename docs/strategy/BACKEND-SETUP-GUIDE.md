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

An isolated TEST D1 database named `wealtharrays-saas-test` has been created in the Cloudflare account's APAC region. It is empty and has not had migrations applied. The production database `wealtharrays-saas` is separate and was not modified.

The old `cloudflare-secrets-sync.yml` workflow was removed because it read the `production` GitHub environment and uploaded TEST Razorpay credentials to the production Worker `wealtharrays-github-io`. Do not restore or run that workflow.

The replacement `.github/workflows/cloudflare-test-deploy.yml` is manual-only, runs from reviewed `main`, reads only the GitHub `TEST` environment, validates that the supplied D1 ID belongs to `wealtharrays-saas-test`, and deploys only the `wealtharrays-api-test` Worker on workers.dev. It has no custom-domain route and cannot deploy the production Worker.

Before running it, add these values under GitHub Settings → Environments → TEST:

**Environment secrets**
- `TEST_CLOUDFLARE_API_TOKEN` — a least-privilege Cloudflare token with D1 read/edit and Workers script edit permissions.
- `TEST_CLOUDFLARE_ACCOUNT_ID`
- `TEST_SUPABASE_URL` — URL for a dedicated TEST Supabase project.
- `TEST_SUPABASE_ANON_KEY` — publishable/anon key only; never use a service-role key.
- The five existing TEST Razorpay secrets: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_PLAN_MONTHLY`, `RAZORPAY_PLAN_YEARLY`, and `RAZORPAY_WEBHOOK_SECRET`.

**Environment variable**
- `TEST_D1_DATABASE_ID` — the ID shown for the `wealtharrays-saas-test` database in Cloudflare D1. Keep it in the TEST environment; do not paste it into chat, PRs or public docs.

The workflow renders `wrangler.test.toml` at run time with this ID, applies migrations only to `wealtharrays-saas-test`, deploys the isolated Worker, uploads TEST secrets to that Worker, then checks `/v1/health` and `/v1/models`. It refuses non-`rzp_test_` keys and verifies the TEST database is not the production database.

After a successful deployment, the TEST API base URL is `https://wealtharrays-api-test.goyalalok565.workers.dev`. The TEST Razorpay webhook endpoint is `https://wealtharrays-api-test.goyalalok565.workers.dev/v1/billing/webhook`.

Do not send Razorpay TEST events to `https://wealtharrays.com/v1/billing/webhook`; that is the production-domain endpoint. Change the Razorpay TEST webhook URL to the workers.dev endpoint only after the TEST Worker is deployed and its health check passes. No production Worker, custom domain, DNS record, or production D1 migration is part of this setup.

## 2. Supabase TEST authentication

A Supabase project is connected and currently active, but it is not yet confirmed as a dedicated TEST project. Its public schema currently has no application tables and its security, performance and health advisors returned no lints. Do not reuse it for TEST if it is intended to become the production project.

1. Confirm which Supabase project is dedicated to TEST, or create a separate TEST project in the owner's organization after checking any project cost.
2. Enable email/password authentication and configure the exact TEST redirect URL(s).
3. Add `TEST_SUPABASE_URL` and `TEST_SUPABASE_ANON_KEY` to the GitHub `TEST` environment. Never use a service-role key.
4. Verify sign-in, sign-out, expired session, invalid token, and cross-user scenario isolation.
5. Confirm local/browser scenarios still work without signup and that cloud sync happens only after an explicit user action.

## 3. Razorpay TEST mode — no live checkout

The owner has created monthly and yearly Razorpay TEST plans and added the five Razorpay values to the GitHub `TEST` environment. Do not regenerate those keys or recreate the plans unless there is a specific reason.

1. Confirm `RAZORPAY_KEY_ID` in the TEST environment starts with `rzp_test_`; the workflow enforces this.
2. Deploy the isolated TEST Worker using the manual workflow only after the Cloudflare and Supabase TEST values above are present.
3. After the TEST Worker health check succeeds, update the Razorpay TEST webhook URL to `https://wealtharrays-api-test.goyalalok565.workers.dev/v1/billing/webhook`. Do not send TEST events to the production-domain URL.
4. Enable the supported subscription lifecycle events documented in `SAAS_SETUP.md`, plus `payment.failed` where available in the Razorpay dashboard.
5. Verify signature rejection, duplicate event idempotency, out-of-order events, retries, cancellation, pause/resume, failed payment and refund.
6. Confirm server-side entitlement checks—not browser flags—control paid features.
7. Keep public production checkout disabled. Never switch to live keys or live plans without separate written owner approval after legal/accounting review.

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
