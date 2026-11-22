# Wealth Arrays Project State

Last updated: 2026-11-22
Repository: `goyalalok565-byte/wealtharrays.github.io`
Default branch: `main`
Current phase: Phase 0 stabilization verified; Phase 1 SaaS activation is blocked on owner-side service configuration.
Status: Production release `b1610d10e5fe7d389140b20efdce6f63b6ef72e8` passed exact-SHA live verification, full production browser smoke and seven-route mobile Lighthouse.

## Mission

Build Wealth Arrays into a trusted global financial intelligence and calculator SaaS platform around five pillars:

1. Calculation Engine — deterministic, reproducible calculations with versioned formulas and golden tests.
2. Financial Intelligence — decision comparisons, scenario analysis, sensitivity and goal planning.
3. SaaS Workspace — accounts, saved calculations, goals, reports and transparent entitlements.
4. Developer Platform — versioned public API, embeddable tools and developer documentation.
5. Global Financial Infrastructure — jurisdiction-specific engines, currencies, number formats and reviewed localization.

Trust, accuracy, privacy and measurable quality take precedence over growth claims. AI may select and explain deterministic models but must never invent financial numbers or tax rules.

## Architecture and source of truth

- Static site is built from repository source and deployed through Cloudflare Pages.
- `scripts/build-dist.mjs` creates the public `dist/` output.
- `calculators.js` is the canonical 55-calculator browser catalogue; `scripts/root-cause-build.mjs` generates split definitions, pages, runtime bundles and sitemap data.
- `worker.mjs` routes `/v1/*` to Cloudflare Worker modules, including `GET /v1/health`.
- The browser calculator library has 55 definitions; the API model registry currently exposes 20 models. Do not claim 55/55 API coverage.
- The current country-specific tax engine is India Tax Year 2026-27. Other country codes/metadata are not country engines.
- 25 currency codes are available, but complete locale-specific formatting and translated UI are not finished. Current translation messages cover English and Hindi; the broader language list is not proof of full localization.
- Supabase, D1 and Razorpay integration code exists but live SaaS readiness is not confirmed.

## Latest verified production release — 2026-11-22

**PR #138** merged as `b1610d10e5fe7d389140b20efdce6f63b6ef72e8`.

### Verification evidence

- Unit Tests: 70/70 passed.
- Calculator browser smoke: 55/55 passed, including zero-denominator and independent boundary behavior.
- Canonical CI, Platform Gates, CodeQL and Cloudflare Workers Builds: PASS.
- Pages build/deployment: PASS.
- L1/L3 live verification run `45042953840`: exact merge-SHA provenance matched; all six required routes returned HTTP 200; SIP/SWP/FIRE static shells passed; all six responses used Brotli and expected cache-control.
- Post-stabilization browser smoke run `45042953874`: PASS. Homepage search, embed, all 55 canonical calculator pages, visual/calculation smoke, four production money-page responsive/calculation checks, deployment manifest exclusions, production embed and homepage search all passed.
- Production mobile Lighthouse run `45042953831`: seven routes × three runs; all strict median thresholds passed.

### Production Lighthouse medians

| Route | Performance | Accessibility | Best Practices | SEO | CLS | TBT | LCP |
|---|---:|---:|---:|---:|---:|---:|---:|
| Homepage | 98 | 100 | 100 | 92 | 0.000 | 0 ms | 2,083 ms |
| Tools | 97 | 100 | 100 | 92 | 0.000 | 0 ms | 2,144 ms |
| SIP | 97 | 100 | 100 | 92 | 0.076 | 0 ms | 2,092 ms |
| SWP | 97 | 100 | 100 | 92 | 0.076 | 1 ms | 2,201 ms |
| FIRE | 97 | 100 | 100 | 92 | 0.076 | 0 ms | 1,929 ms |
| Rent vs Buy | 97 | 100 | 100 | 92 | 0.070 | 0 ms | 1,951 ms |
| Compound Interest guide | 98 | 100 | 100 | 92 | 0.000 | 0 ms | 2,091 ms |

Performance average: 97.3. Worst median LCP: 2,201 ms. Worst median CLS: 0.076. Worst median TBT: 1 ms.

Production SEO 92 is the known Cloudflare-managed Content Signals / Lighthouse parser warning documented below. Keep the directive; do not remove it solely to increase a lab score.

## Current product, growth and business readiness

### Product and calculation quality

- 55/55 calculator pages pass the value-content audit: at least 650 educational words, calculator-specific guidance, a worked example, FAQs, related article links and valid software/breadcrumb schema.
- 55/55 canonical calculator pages pass browser smoke and responsive checks.
- Independent reference vectors exist for selected financial models; snapshots across 55 calculators lock behavior but do not independently prove every formula correct.
- India tax terminology is year-aware; CA/legal review of tax eligibility wording remains outstanding.

### Search and AI visibility

Google Search Console, property `sc-domain:wealtharrays.com`, 24 October–20 November 2026:

- 38 organic clicks and 96 impressions.
- 29 clicks came from the visible branded query `wealth arrays`.
- 16 countries generated impressions; all 38 clicks were from India.
- Mobile: 19 clicks, average position 2.84. Desktop: 19 clicks, average position 17.79.
- This is an early, low-volume baseline, not evidence of global organic scale. A comparable previous 28-day period is not available in the connected trial history.
- AI search visibility is not measured yet: the GEO project needs setup and tracked prompts before share-of-voice claims can be made.

### Globalization and developer platform

- API registry: 20 models versus 55 browser calculators; 35 browser calculators are not yet exposed as API models.
- India is the only active country-specific tax engine. US, UK, UAE, Canada, Australia, Singapore and EU engines require separate reviewed implementations.
- 25 currency codes exist; locale-specific grouping, formats, translations, hreflang and country-specific legal content still need completion.
- Current UI translation messages cover English and Hindi; do not advertise the other language codes as fully translated.

### Monetization and SaaS activation

- `ads.txt` exists, but no verified publisher ad-slot placements are present in the public calculator/article HTML. AdSense approval is not verified. A publisher record alone does not generate ad revenue.
- Razorpay checkout/webhook code and Pro monthly/yearly plan hooks exist; live billing is not active/verified.
- Supabase Auth and D1 scenario-sync code exist; production activation is not verified.
- The API deployment-readiness workflow on merge SHA `b1610d1` reported **Worker deployment NOT performed** by that GitHub workflow because `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_D1_DATABASE_ID` were empty in its environment. It also reported Supabase and Razorpay runtime configuration missing. The separate Cloudflare Workers Builds check and live static-site provenance succeeded; this does not prove D1/auth/billing readiness.
- `GET /v1/health` and a 15-minute health-monitor workflow exist. The latest post-release health-monitor result still needs to be captured; static route verification does not prove `ready_for_saas=true`.
- Public pricing, live Free/Pro entitlements, backup/retention, alerting/abuse monitoring and a full DPDP Act review remain pending.

## Phase 0 — status

<badge>Verified in production</badge>

1. Calculator static shells, CLS reservation and 55-route registry parity are in place.
2. Strict seven-route mobile Lighthouse median gates pass on production.
3. Tax Year 2026-27 / Section 156 terminology and regression coverage are in place; legal review remains.
4. The canonical 55-calculator registry drives pages, tools, search, sitemap, `llms.txt`, methodology and metadata.
5. `GET /v1/health`, dependency readiness flags and scheduled health monitor code are present; actual SaaS readiness remains unverified.
6. Public deployment manifest and internal-path exclusion checks pass in production smoke.

## Phase 1 — owner configuration required

Backend activation requires the owner to configure these names as GitHub Actions repository secrets (never put values in chat or documentation):

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_D1_DATABASE_ID`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_PLAN_MONTHLY`
- `RAZORPAY_PLAN_YEARLY`
- `RAZORPAY_WEBHOOK_SECRET`

Owner steps: create the D1 database; configure Supabase email auth and redirect URLs; create Razorpay test plans and webhook; add secrets in GitHub Settings → Secrets and variables → Actions; then run migrations and test account confirmation, cross-user isolation, checkout, webhook retries, cancellation, refunds and entitlement reconciliation. Use test mode before live billing.

For global payments, the documented decision is Razorpay for India and Paddle for international sales, subject to Paddle seller approval and India payout-route confirmation. Paddle integration is not present in the current code.

## Next actions

1. Capture the scheduled `/v1/health` result and activate D1, Supabase and Razorpay only after owner-side configuration.
2. Obtain AdSense approval and create real ad-unit slots before expecting ad revenue; keep ad loading consent-aware and absent on pages without slots.
3. Complete CA/lawyer review, DPDP review, backup/retention and monitoring; then expand API parity, localization and country engines one jurisdiction at a time.
4. Grow non-branded search traffic and set up GEO prompts/monitoring. Prioritize useful financial decision workflows over adding calculator count alone.

## Decisions

- India-first, global architecture; metadata-only country codes are not country engines.
- Preserve financial formulas unless authoritative reference vectors and tests justify a change.
- Do not lower release thresholds to get a green workflow.
- Local `dist/` is not a substitute for exact-SHA production evidence.
- Never claim AdSense approval, revenue, rankings, global traction or SaaS activation without measurements.

## Paddle seller onboarding — India preflight

- Paddle's official seller-country policy says it works with software businesses globally except its published unsupported-country list; India is not listed among those exclusions. This means country-level eligibility appears possible, not guaranteed seller approval.
- All checkout domains require domain review: live HTTPS site, clear product description, pricing (a screenshot can be supplied if pricing is not live yet), features/deliverables, Terms, Refund Policy and Privacy Policy. Paddle may request a test account for login-gated products.
- Business verification may request government business-registration documents and ownership breakdown for every owner at or above 25%; this business-document step is not required for individuals/sole traders. Identity verification applies to at least one business owner, or to the individual/sole trader; government ID, proof of address and sometimes liveness may be requested.
- Payouts are monthly: balance above the minimum $100 threshold enters the queue on the 1st, Paddle sends by the 15th, and arrival can take up to 3 working days. Published payout methods are wire transfer or Payoneer. India-specific bank/Payoneer availability, currency conversion, fees and required tax documentation still need written confirmation from Paddle.
- Official references: https://www.paddle.com/help/start/account-verification/which-countries-are-supported-by-paddle ; https://www.paddle.com/help/start/account-verification/what-is-domain-verification ; https://www.paddle.com/help/start/account-verification/what-is-business-verification ; https://www.paddle.com/help/start/account-verification/what-is-identity-verification ; https://www.paddle.com/help/manage/get-paid/when-and-how-do-i-get-paid

### Payment-provider alternatives checked

- Stripe India new-account onboarding is invite-only; Stripe requires an invite request and may ask for business IDs, site/app URL, business description, bank details, and IEC/RBI Transaction Purpose Code for international transactions. Official: https://support.stripe.com/questions/stripe-accounts-are-invite-only-in-india and https://support.stripe.com/questions/how-can-i-open-a-stripe-account-in-india
- Lemon Squeezy stopped accepting new users/store sign-ups on 16 Nov 2026 and will stop processing transactions and subscription renewals on 31 Mar 2027. Official: https://docs.lemonsqueezy.com/migration
- Paddle acts as Merchant of Record for supported sales and handles customer sales-tax calculation/collection/remittance. This does not replace the Indian seller's own income-tax/GST/accounting obligations; CA review remains required.




### Payment-provider alternatives checked

- Stripe India new-account onboarding is invite-only; Stripe requires an invite request and may ask for business IDs, site/app URL, business description, bank details, and IEC/RBI Transaction Purpose Code for international transactions. Official: https://support.stripe.com/questions/stripe-accounts-are-invite-only-in-india and https://support.stripe.com/questions/how-can-i-open-a-stripe-account-in-india
- Lemon Squeezy stopped accepting new users/store sign-ups on 16 Nov 2026 and will stop processing transactions and subscription renewals on 31 Mar 2027. Official: https://docs.lemonsqueezy.com/migration
- Paddle acts as Merchant of Record for supported sales and handles customer sales-tax calculation/collection/remittance. This does not replace the Indian seller's own income-tax/GST/accounting obligations; CA review remains required.

## India tax-year terminology and sources

- Tax Year 2026–27 (income from 1 April 2026): Income-tax Act, 2025, Section 156. Current new-regime calculator widget/runtime uses this label.
- Assessment Year 2026–27 (income in FY 2025–26): Income-tax Act, 1961, Section 87A. This remains the applicable old-Act reference despite return filing after 1 April 2026.
- Official Income Tax Department sources: AY/FY transition FAQ https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/income-tax-returns ; AY 2026–27 Section 87A rates/rebate https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/file-itr-2-online ; TY 2026–27 estimator manual https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/income-and-tax-estimator-um ; Section 156 Act PDF https://wmstatic-prd.incometaxindia.gov.in/documents/20117/42998/Section-156_2026-04-01_05-11-58_344893_en.pdf/415b0f0e-8826-feaa-b374-481e54d4b98e?t=1775046534568&version=9.0 .
- `widget.js` and `wa-calculator-runtime.js` are changed together; canonical CI's root-cause build regenerates the runtime from canonical source modules. No tax formula or rebate eligibility model is changed in this PR. CA/legal review remains required before Phase 1.

## Zero-denominator ratio handling — 2026-11-22

- ROI now treats a zero investment-cost denominator as undefined for total and annualized ROI; Profit Margin treats zero revenue as undefined for gross and net margin. The UI, charts, and PDF exports display an em dash rather than a misleading 0%.
- Blank inputs remain distinct from numeric zero. Regression snapshots and independent reference vectors cover both zero-denominator cases.
- Browser QA explicitly exercises both cases and restores valid inputs before independent field-boundary checks.
- Verification evidence from the preceding candidate based on an earlier main SHA: 55/55 calculator browser smoke, 70/70 unit tests, CodeQL, Canonical CI, Platform Gates, Worker build, and the strict seven-route three-run median Lighthouse gate passed. The current-main replay must complete its own fresh CI before merge.
- Production deployment, live API health, AdSense approval/ad-slot configuration, and Supabase/D1/Razorpay activation remain separate verification/owner-configuration items; do not infer them from preview checks.

