# Wealth Arrays SaaS activation checklist

The repository now contains the application code for browser-first scenarios, an optional account sync flow, versioned calculation endpoints, indicative FX rates, an Indian tax estimate endpoint, and Razorpay subscription checkout/webhook handlers. The account, cloud database and billing features remain intentionally fail-closed until the external services are configured.

## 1. Cloudflare Worker API + D1

The deployment has two distinct pieces: Cloudflare Pages serves the static website from the GitHub repository, while a Wrangler-managed Cloudflare Worker handles /v1/* API requests on the same domain. Do not configure these API routes as Pages Functions; worker.mjs is the API entry point and wrangler.toml is its source of truth.

1. Create a Cloudflare D1 database for Wealth Arrays.
2. Add these GitHub Actions repository secrets: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, and CLOUDFLARE_D1_DATABASE_ID.
3. The cloudflare-worker-deploy.yml workflow appends the D1 binding named DB, applies every migration in migrations/ in order, and deploys the Worker when Cloudflare credentials are present.
4. wrangler.toml declares PUBLIC_API_LIMITER (120 requests/minute per IP and route) for public calculation/tax/FX endpoints and signed webhook delivery, plus WRITE_API_LIMITER (20 requests/minute per IP and route) for scenario writes, checkout and cancellation. Cloudflare's Rate Limiting API is approximate and distributed per Cloudflare location; it is an abuse-control layer, not a strict global quota.
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
- `TURNSTILE_SECRET_KEY`
- `TURNSTILE_SITE_KEY`

Configure the Razorpay webhook URL as https://wealtharrays.com/v1/billing/webhook and enable subscription.authenticated, subscription.activated, subscription.charged, subscription.pending, subscription.halted, subscription.cancelled, subscription.completed, subscription.paused, subscription.resumed, payment.failed, and payment.refunded. The handler verifies HMAC signatures, uses Razorpay's x-razorpay-event-id for idempotency, atomically claims each event to prevent concurrent duplicate processing, rejects stale lifecycle transitions using provider event timestamps, and records safe payment metadata. A linked payment.refunded event immediately sets the subscription to refunded and revokes Pro entitlement; later lifecycle events cannot reactivate that refunded provider subscription. payment.failed is recorded without automatically revoking access. Events arriving before their local subscription row remain retryable. Use test-mode credentials and test plans before enabling live billing. Prices are intentionally not hardcoded; actual amounts and tax treatment must be set and reviewed in Razorpay.

## 3A. Turnstile request verification

1. In Cloudflare Dashboard, open **Turnstile → Add widget**; allow `wealtharrays.com` and `www.wealtharrays.com`.
2. Save the public site key as GitHub Actions secret `TURNSTILE_SITE_KEY` and the secret key as `TURNSTILE_SECRET_KEY`. Never paste either value into chat or commit them.
3. In Supabase Dashboard, open **Authentication → Security and Protection → CAPTCHA** (wording may vary), enable CAPTCHA, choose Cloudflare Turnstile, and enter the secret key.
4. The account page supplies Supabase's `captcha_token` on signup/password sign-in. The Worker independently verifies Turnstile for cloud scenario writes, checkout and cancellation; the Razorpay webhook is excluded and remains protected by signed event verification.
5. The Worker write routes fail closed with a service-unavailable response until the secret is configured, reject missing/invalid tokens, apply the API rate limiter, and allow browser origins only from the production Wealth Arrays domains.
6. After deployment, test one valid and one invalid token in TEST mode; verify 429 responses include `Retry-After`, and confirm unapproved origins receive no CORS allow-origin header.

## 4. API notes

- `POST /v1/calculate` supports the model IDs returned by `GET /v1/models`. Model version `1.0.0` is explicit; unsupported IDs and versions return errors.
- `GET /v1/fx?base=INR&symbols=USD,EUR` returns indicative rates from open.er-api.com with a 15-minute cache. These are not executable bank/trading quotes and the provider has no SLA guaranteed by this site.
- `POST /v1/india-tax` currently supports only the Indian new tax regime for Tax Year 2026-27 under the Income-tax Act, 2025 and accepts **taxable income**, not gross salary. Do not confuse this with Assessment Year 2026-27 under the old Act: AY 2026-27 concerns income from FY 2025-26, while Tax Year 2026-27 concerns income from FY 2026-27. The caller must explicitly confirm Section 156 rebate eligibility. For Tax Year 2026-27, the rebate is under Section 156 of the Income-tax Act, 2025 (Section 87A applies to Assessment Year 2026-27 under the repealed Income-tax Act, 1961). It does not automatically apply standard deduction and excludes special-rate income and several individual-specific details. It is an estimate, not tax filing software. Verify rates and individual eligibility against current official guidance: https://www.incometaxindia.gov.in/w/tax-rates-and-computation

## 5. Privacy and security

- Local scenarios stay in browser storage until the user explicitly clicks **Sync to account**.
- Shared scenario links contain input values in URL query parameters. Do not put sensitive identifiers or credentials in them.
- Cloud scenarios require a valid Supabase session and are scoped to that user's ID.
- Razorpay webhook events are accepted only after HMAC signature verification, atomically claimed by provider event ID, and deduplicated. Full lifecycle state transitions are ordered by provider event timestamp; a refund revokes Pro and later events cannot reactivate that refunded subscription. Events arriving before their local subscription row remain retryable.
- Public calculation, tax and FX endpoints fail closed if the Cloudflare rate-limiter binding is missing. Scenario writes, checkout and cancellation are also rate-limited and require Turnstile; the webhook uses signature verification and event idempotency instead.
- The Worker requires verified Supabase email for account-backed API access. D1 migrations and restore prerequisites are documented in [D1 migration and restore plan](docs/saas/D1-MIGRATION-AND-RESTORE-PLAN.md).
- Before production billing, test account confirmation, expired sessions, cross-user scenario isolation, webhook retries, out-of-order events, cancellations, refunds and subscription state reconciliation against Razorpay test mode.
- Backups/retention policy, alerting/abuse monitoring and a full DPDP Act review still need to be completed for production.
