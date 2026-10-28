# Wealth Arrays SaaS activation checklist

The repository now contains the application code for browser-first scenarios, an optional account sync flow, versioned calculation endpoints, indicative FX rates, an Indian tax estimate endpoint, and Razorpay subscription checkout/webhook handlers. The account, cloud database and billing features remain intentionally fail-closed until the external services are configured.

## 1. Cloudflare Pages Functions + D1

1. Create a Cloudflare D1 database for Wealth Arrays.
2. In the Cloudflare Pages project settings, add a D1 database binding named **DB** pointing at that database.
3. Apply all SQL migrations in `migrations/` to the database in order, for example with Wrangler's remote D1 migration command.
4. Confirm the Functions directory at the repository root is deployed with the Pages project. Routes implemented here include `/v1/calculate`, `/v1/models`, `/v1/fx`, `/v1/india-tax`, `/v1/scenarios`, and `/v1/billing/*`.

## 2. Supabase authentication

Create a Supabase project, enable email/password authentication, and set the site's account URL as an allowed redirect URL. Add these Cloudflare Pages environment variables for both Preview and Production as appropriate:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` (the public anon/publishable key only; never use a service-role key in the browser)

The browser account page uses Supabase Auth REST endpoints. Server-side scenario APIs verify each access token against Supabase before touching D1. Cloud scenario data is always scoped to the authenticated user ID. The browser-only saved scenarios continue to work without an account.

## 3. Razorpay subscriptions

Create the monthly and yearly subscription plans in the Razorpay dashboard and configure:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_PLAN_MONTHLY`
- `RAZORPAY_PLAN_YEARLY`
- `RAZORPAY_WEBHOOK_SECRET`

Configure the Razorpay webhook URL as `https://wealtharrays.com/v1/billing/webhook` and enable the subscription events used by the handler: `subscription.activated`, `subscription.charged`, `subscription.pending`, `subscription.halted`, `subscription.cancelled`, and `subscription.completed`. Use test-mode credentials and test plans before enabling live billing. Prices are intentionally not hardcoded; the actual amounts and tax treatment must be set and reviewed in Razorpay.

## 4. API notes

- `POST /v1/calculate` supports the model IDs returned by `GET /v1/models`. Model version `1.0.0` is explicit; unsupported IDs and versions return errors.
- `GET /v1/fx?base=INR&symbols=USD,EUR` returns indicative rates from open.er-api.com with a 15-minute cache. These are not executable bank/trading quotes and the provider has no SLA guaranteed by this site.
- `POST /v1/india-tax` currently supports only the Indian new tax regime for tax year 2026-27 and accepts **taxable income**, not gross salary. It does not automatically apply standard deduction and excludes special-rate income and several individual-specific details. It is an estimate, not tax filing software. Verify rates and individual eligibility against current official guidance: https://www.incometaxindia.gov.in/w/tax-rates-and-computation

## 5. Privacy and security

- Local scenarios stay in browser storage until the user explicitly clicks **Sync to account**.
- Shared scenario links contain input values in URL query parameters. Do not put sensitive identifiers or credentials in them.
- Cloud scenarios require a valid Supabase session and are scoped to that user's ID.
- Razorpay webhook events are accepted only after HMAC signature verification.
- Before production billing, test account confirmation, expired sessions, cross-user scenario isolation, webhook retries, cancellations, refunds and subscription state reconciliation.
- Rate limiting, abuse monitoring, backups/retention policy and a full DPDP Act review still need to be configured for the production environment.
