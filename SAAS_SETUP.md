# Wealth Arrays SaaS activation checklist

The repository now contains the application code for browser-first scenarios, an optional account sync flow, versioned calculation endpoints, indicative FX rates, an Indian tax estimate endpoint, and Razorpay subscription checkout/webhook handlers. The account, cloud database and billing features remain intentionally fail-closed until the external services are configured.

## 1. Cloudflare Worker API + D1

The current repository deployment uses a Wrangler-managed Cloudflare Worker with Workers Static Assets. `npm run build` generates `dist/`; `wrangler.toml` points `[assets].directory` to `./dist`, and `run_worker_first=["/v1/*"]` routes API requests through `worker.mjs`. This is not a separate Cloudflare Pages static deployment. Do not configure these API routes as Pages Functions; `worker.mjs` is the API entry point and `wrangler.toml` is its source of truth.

1. Create a Cloudflare D1 database for Wealth Arrays.
2. Add these GitHub Actions repository secrets: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, and CLOUDFLARE_D1_DATABASE_ID.
3. The cloudflare-worker-deploy.yml workflow appends the D1 binding named DB, applies every migration in migrations/ in order, and deploys the Worker when Cloudflare credentials are present.
4. wrangler.toml declares PUBLIC_API_LIMITER. It limits each client IP to 120 requests per minute per API route for /v1/calculate, /v1/india-tax, and /v1/fx. Cloudflare's Rate Limiting API is approximate and distributed per Cloudflare location; it is an abuse-control layer, not a strict global quota.
5. The Worker deploy workflow handles the API and Worker Static Assets from `dist/`. It does not by itself prove which version receives live traffic; confirm the active production version, branch control, traffic allocation and rollback target in Cloudflare.

## 2. Supabase authentication

Create a Supabase project, enable email/password authentication, and set the site's account URL as an allowed redirect URL. Add these GitHub Actions repository secrets so the deploy workflow can configure the Worker:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` (the public anon/publishable key only; never use a service-role key in the browser)

The browser account page uses Supabase Auth REST endpoints. Server-side scenario APIs verify each access token against Supabase before touching D1. Cloud scenario data is always scoped to the authenticated user ID. The browser-only saved scenarios continue to work without an account.

## 3. Razorpay subscriptions

Create the monthly and yearly subscription plans in the Razorpay dashboard and add the following GitHub Actions repository secrets:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_PLAN_MONTHLY`
- `RAZORPAY_PLAN_YEARLY`
- `RAZORPAY_WEBHOOK_SECRET`

Configure the Razorpay webhook URL as https://wealtharrays.com/v1/billing/webhook and enable subscription.authenticated, subscription.activated, subscription.charged, subscription.pending, subscription.halted, subscription.cancelled, subscription.completed, subscription.paused, subscription.resumed, payment.failed, and payment.refunded. The handler verifies HMAC signatures, uses Razorpay's x-razorpay-event-id for idempotency, rejects stale lifecycle transitions using provider event timestamps, and records safe payment metadata. Payment failures/refunds are recorded but do not independently revoke subscription access; subscription lifecycle events remain authoritative. Use test-mode credentials and test plans before enabling live billing. Prices are intentionally not hardcoded; actual amounts and tax treatment must be set and reviewed in Razorpay.

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


## 6. Pro trial and checkout concurrency

The application code on the current PR branch includes an explicit 14-day Pro trial with no payment method:
- The user must sign in with an email confirmed by Supabase; the server checks Supabase's trusted `email_confirmed_at` / `confirmed_at` fields.
- The user must explicitly choose **Start 14-day Pro trial** on the account page. Creating an account or signing in does not start the trial.
- D1 migration `0003_pro_trials.sql` stores the claim, start/end timestamps and a SHA-256 digest of the normalized verified email. A unique user ID and unique email digest enforce one claim per account/email. The raw email is not copied into the trial table.
- Server entitlements grant the Pro scenario limit while the trial is active and automatically return to Free after the 14-day end timestamp. Paid subscription entitlement takes precedence.
- Apply all D1 migrations before routing traffic to code that queries the trial table. The feature is not live until Supabase email confirmation, D1 migration and the deployed Worker are verified together.

Checkout creation is serialized with `0004_billing_checkout_locks.sql`:
- One active checkout-creation lock per account prevents concurrent requests from creating multiple Razorpay subscriptions.
- A successful provider create is persisted before the lock is released.
- If the network or provider returns an ambiguous result, the lock remains to fail closed. Do not ask the user to retry repeatedly. Support/operator must inspect Razorpay for the subscription using the account's `user_id` note, reconcile the provider subscription into D1, and only then clear the lock through an approved operational procedure.
- Razorpay subscription creation documentation does not establish a generic create-subscription idempotency header. Do not invent one or assume webhook event-id deduplication protects the create request.

## Current deployment and consent implementation note

AdSense must remain blocked until the Funding Choices CMP reports consent-mode data. The implementation loads the AdSense tag only when ad storage, ad user data and ad personalization are granted or not applicable; denied, unknown, missing or unconfigured states fail closed. Confirm the matching Google Privacy & Messaging consent-mode configuration and obtain legal review before enabling live ads.
