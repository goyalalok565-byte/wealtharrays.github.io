# Wealth Arrays SaaS activation checklist

The repository now contains the application code for browser-first scenarios, an optional account sync flow, versioned calculation endpoints, indicative FX rates, an Indian tax estimate endpoint, and Razorpay subscription checkout/webhook handlers. The account, cloud database and billing features remain intentionally fail-closed until the external services are configured.

## 1. Cloudflare Worker API + D1

The deployment has two distinct pieces: Cloudflare Pages serves the static website from the GitHub repository, while a Wrangler-managed Cloudflare Worker handles /v1/* API requests on the same domain. Do not configure these API routes as Pages Functions; worker.mjs is the API entry point and wrangler.toml is its source of truth.

1. Create a Cloudflare D1 database for Wealth Arrays.
2. Add these GitHub Actions repository secrets: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, and CLOUDFLARE_D1_DATABASE_ID.
3. The cloudflare-worker-deploy.yml workflow appends the D1 binding named DB, applies every migration in migrations/ in order, and deploys the Worker when Cloudflare credentials are present.
4. wrangler.toml declares PUBLIC_API_LIMITER. It limits each client IP to 120 requests per minute per API route for /v1/calculate, /v1/india-tax, and /v1/fx. Cloudflare's Rate Limiting API is approximate and distributed per Cloudflare location; it is an abuse-control layer, not a strict global quota.
5. The static Cloudflare Pages deployment remains separate. Confirm its production branch and build/output settings match the repository's static-site build; the Worker workflow does not deploy the Pages site.

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
- `POST /v1/india-tax` currently supports only the Indian new tax regime for tax year 2026-27 and accepts **taxable income**, not gross salary. The caller must explicitly confirm Section 87A rebate eligibility. It does not automatically apply standard deduction and excludes special-rate income and several individual-specific details. It is an estimate, not tax filing software. Verify rates and individual eligibility against current official guidance: https://www.incometaxindia.gov.in/w/tax-rates-and-computation

## 5. Privacy and security

- Local scenarios stay in browser storage until the user explicitly clicks **Sync to account**.
- Shared scenario links contain input values in URL query parameters. Do not put sensitive identifiers or credentials in them.
- Cloud scenarios require a valid Supabase session and are scoped to that user's ID.
- Razorpay webhook events are accepted only after HMAC signature verification and are deduplicated by provider event ID. Events arriving before their local subscription row remain retryable.
- Public calculation, tax and FX endpoints fail closed if the Cloudflare rate-limiter binding is missing.
- Before production billing, test account confirmation, expired sessions, cross-user scenario isolation, webhook retries, out-of-order events, cancellations, refunds and subscription state reconciliation against Razorpay test mode.
- Backups/retention policy, alerting/abuse monitoring and a full DPDP Act review still need to be completed for production.
