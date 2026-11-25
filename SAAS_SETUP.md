# Wealth Arrays SaaS activation checklist

The repository now contains the application code for browser-first scenarios, an optional account sync flow, versioned calculation endpoints, indicative FX rates, an Indian tax estimate endpoint, and Razorpay subscription checkout/webhook handlers. The account, cloud database and billing features remain intentionally fail-closed until the external services are configured.

## 1. Cloudflare Worker API + D1

Production and TEST are separate deployments:

- Production: `wealtharrays-github-io`, custom route `wealtharrays.com/v1/*`, production D1 `wealtharrays-saas`. The production deployment workflow applies remote migrations and deploys this Worker. Do not use it for TEST or run it without separate written production-release approval.
- TEST: `wealtharrays-api-test`, workers.dev only, dedicated D1 `wealtharrays-saas-test`. The isolated config is `wrangler.test.toml`; the manual `.github/workflows/cloudflare-test-deploy.yml` workflow reads only the GitHub `TEST` environment and checks the D1 identity before applying migrations.

The old `cloudflare-secrets-sync.yml` workflow was removed because it read the `production` environment and uploaded TEST credentials to the production Worker. Do not recreate that workflow.

For TEST, add these values only under GitHub Settings → Environments → TEST:
- Secrets: `TEST_CLOUDFLARE_API_TOKEN`, `TEST_CLOUDFLARE_ACCOUNT_ID`, `TEST_SUPABASE_URL`, `TEST_SUPABASE_ANON_KEY`.
- Variable: `TEST_D1_DATABASE_ID` for the dedicated TEST database.
- Razorpay TEST secrets: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_PLAN_MONTHLY`, `RAZORPAY_PLAN_YEARLY`, `RAZORPAY_WEBHOOK_SECRET`.

The TEST workflow refuses a key that does not start with `rzp_test_`, verifies that the D1 ID maps to `wealtharrays-saas-test` and differs from production, applies migrations to the TEST database only, deploys a Worker with no custom-domain route, uploads runtime secrets to that Worker only, and verifies `/v1/health` plus `/v1/models`.

The TEST base URL after deployment is `https://wealtharrays-api-test.goyalalok565.workers.dev`. The production Worker and D1 are not changed by this workflow. Keep production secrets, DNS, routes, and migrations separate.

The static website remains served by the existing Cloudflare site deployment. The API Worker serves `/v1/*`. The public API rate limiter allows 120 requests per minute per client IP for `/v1/calculate`, `/v1/india-tax`, and `/v1/fx`; Cloudflare rate limiting is approximate and distributed per location, not a strict global quota.


## 2. Supabase authentication

The current Supabase project is active but has no public application tables and is not yet confirmed as a dedicated TEST project. Use a separate TEST project for the TEST Worker; do not copy production credentials into the TEST environment.

- Add `TEST_SUPABASE_URL` and `TEST_SUPABASE_ANON_KEY` to GitHub `TEST` environment secrets.
- Use the publishable/anon key only; never use a service-role key in browser or Worker configuration.
- Enable email/password authentication and allow only the exact TEST redirect URL(s).
- Verify sign-in, sign-out, expired/invalid token handling and cross-user scenario isolation.
- The browser-only saved scenarios must continue to work without signup. Cloud sync should happen only after explicit user action.

The production project/credentials remain separate and should not be enabled in the production Worker until TEST evidence and legal review are complete.


## 3. Razorpay subscriptions

The owner has created monthly and yearly Razorpay TEST plans and confirmed the five Razorpay secrets are saved in the GitHub `TEST` environment. Do not regenerate these keys or recreate the plans unless there is a specific reason.

TEST-only setup:
- `RAZORPAY_KEY_ID` must start with `rzp_test_`; the TEST deployment workflow enforces this.
- TEST webhook endpoint after successful TEST Worker deployment: `https://wealtharrays-api-test.goyalalok565.workers.dev/v1/billing/webhook`.
- Production-only webhook endpoint: `https://wealtharrays.com/v1/billing/webhook`. Never send TEST events to this production-domain endpoint.
- Update the Razorpay TEST webhook URL only after the TEST Worker has deployed and `/v1/health` reports `ready_for_saas=true`.
- Enable the supported subscription lifecycle events: `subscription.authenticated`, `subscription.activated`, `subscription.charged`, `subscription.pending`, `subscription.halted`, `subscription.cancelled`, `subscription.completed`, `subscription.paused`, and `subscription.resumed`; also `payment.failed` where available in the dashboard.

The handler verifies HMAC signatures, uses Razorpay's `x-razorpay-event-id` for idempotency, rejects stale lifecycle transitions using provider event timestamps, and records safe payment metadata. Payment failures/refunds are recorded but do not independently revoke subscription access; subscription lifecycle events remain authoritative. Use test-mode credentials and test plans before enabling live billing. Prices are intentionally not hardcoded; actual amounts and tax treatment must be set and reviewed in Razorpay.

Production billing remains disabled until explicit owner approval after full TEST lifecycle proof, CA/legal review and security/privacy sign-off.


## 4. API notes

- `POST /v1/calculate` supports the model IDs returned by `GET /v1/models`. Model version `1.0.0` is explicit; unsupported IDs and versions return errors.
- `GET /v1/fx?base=INR&symbols=USD,EUR` returns indicative rates from open.er-api.com with a 15-minute cache. These are not executable bank/trading quotes and the provider has no SLA guaranteed by this site.
- `POST /v1/india-tax` currently supports only the Indian new tax regime for Tax Year 2026-27 under the Income-tax Act, 2025 and accepts **taxable income**, not gross salary. Do not confuse this with Assessment Year 2026-27 under the old Act: AY 2026-27 concerns income from FY 2025-26, while Tax Year 2026-27 concerns income from FY 2026-27. The caller must explicitly confirm Section 156 rebate eligibility. For Tax Year 2026-27, the rebate is under Section 156 of the Income-tax Act, 2025 (Section 87A applies to Assessment Year 2026-27 under the repealed Income-tax Act, 1961). It does not automatically apply standard deduction and excludes special-rate income and several individual-specific details. It is an estimate, not tax filing software. Verify rates and individual eligibility against current official guidance: https://www.incometaxindia.gov.in/w/tax-rates-and-computation

## 5. Privacy and security

- Local scenarios stay in browser storage until the user explicitly clicks **Sync to account**.
- Shared scenario links contain input values in URL query parameters. Do not put sensitive identifiers or credentials in them.
- Cloud scenarios require a valid Supabase session and are scoped to that user's ID.
- Razorpay webhook events are accepted only after HMAC signature verification and are deduplicated by provider event ID. Events arriving before their local subscription row remain retryable.
- Public calculation, tax and FX endpoints fail closed if the Cloudflare rate-limiter binding is missing.
- Before production billing, test account confirmation, expired sessions, cross-user scenario isolation, webhook retries, out-of-order events, cancellations, refunds and subscription state reconciliation against Razorpay test mode.
- Backups/retention policy, alerting/abuse monitoring and a full DPDP Act review still need to be completed for production.
