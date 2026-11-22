# Wealth Arrays Project State

Last updated: 2026-11-22
Repository: `goyalalok565-byte/wealtharrays.github.io`
Default branch: `main`
Current phase: Phase 0 engineering gates passed on production main SHA `b1610d10e5fe7d389140b20efdce6f63b6ef72e8`.
Status: Phase 0 engineering gates are deployed on production main SHA `619bacb6b2ac2c77804061f78e61bf61757f9c40`. L1 measurement PR #144 is merged and exact-SHA production verification passed; seven-route mobile Lighthouse artifact is recorded. PR #146 adds production consent/RUM browser coverage and is merged; its post-merge production run is pending. L2 backend security/billing hardening remains in draft PR #145 and requires owner-managed service configuration plus TEST-mode end-to-end verification. Commercial launch remains blocked on credentials, legal/CA review and the owner's written go-live approval.


## L1 measurement — merged and production verified

- PR #144 merged; production SHA: `bc33ed7c5d8b98f3344e621392002bd89793aab2`.
- Production live verification and homepage search browser smoke passed on that SHA.
- Seven-route mobile Lighthouse passed with three measurements per route; artifact is Actions run 45048289283.
- PR #146 merged to add explicit consent reject/accept browser verification for GA4 and Core Web Vitals. Production execution is pending its next exact-SHA post-stabilization run; GA4 DebugView receipt still requires owner confirmation.

## L2 backend hardening PR candidate — 2026-11-22

Branch: `saas/l2-backend-hardening`; draft PR #145 (not merged).

- D1 migration/restore plan committed before any migration change. This branch adds no D1 migration and does not modify the existing migration ledger.
- `docs/saas/LAUNCH-READINESS-TRACKER.md` records Beta/Commercial gates, owner-only setup steps and lead times, L3 product acceptance, L4 content batches, L5 legal review and L6 beta operations.
- Worker write endpoints for scenarios, checkout and cancellation are rate-limited (dedicated write limiter) and require server-verified Cloudflare Turnstile tokens; the signed Razorpay webhook is rate-limited separately and remains outside the browser challenge flow.
- Worker CORS uses an explicit production origin allowlist.
- Supabase-backed Worker access requires a verified email address.
- Razorpay webhook processing uses a conditional atomic claim, retryable unlinked events, and refund-driven entitlement revocation. Refund is terminal even if its webhook arrives after a newer lifecycle event.
- Browser account and cloud-save requests obtain one-time Turnstile tokens. Supabase CAPTCHA must be enabled by the owner before signup/login can pass.
- Security and lifecycle audits are wired into Unit Tests. Latest branch CI is being rerun after removing dynamic test-module evaluation; final checks remain pending.
- No live credentials, D1 database, Razorpay TEST flow, or Cloudflare secrets are present in this branch; production SaaS readiness remains blocked.

## Mission

Build Wealth Arrays into a trusted global financial intelligence and calculator SaaS platform around five pillars:

1. Calculation Engine — deterministic, reproducible calculations with versioned formulas and golden tests.
2. Financial Intelligence — decision comparisons, scenario analysis, sensitivity and goal planning.
3. SaaS Workspace — accounts, saved calculations, goals, reports and transparent entitlements.
4. Developer Platform — versioned public API, embeddable tools and developer documentation.
5. Global Financial Infrastructure — jurisdiction-specific engines, currencies, number formats and reviewed localization.

Trust, accuracy, privacy and measurable quality take precedence over growth claims. AI may select and explain deterministic models but must never invent financial numbers or tax rules.

## Architecture and source of truth

- Static site is built from repository source and deployed through Cloudflare.
- `scripts/build-dist.mjs` creates public `dist/` output.
- `calculators.js` is the canonical 55-calculator browser catalogue; `scripts/root-cause-build.mjs` generates split definitions, pages, runtime bundles and sitemap data.
- `wa-calculator-runtime.js` is the calculator-page runtime entry point.
- `worker.mjs` routes `/v1/*` to Cloudflare Worker modules.
- Supabase, D1 and Razorpay integration code exists but live end-to-end activation is not verified.
- API model coverage is smaller than the browser calculator catalogue. A country code in generic API metadata is not a country-specific tax engine.
- India tax labels must be tax-year-aware and legally reviewed. Never change formula or eligibility logic without approved sources and regression vectors.

## Release discipline

- Complete Phase 0 before Phase 1–5 unless the owner explicitly changes priority.
- Work in small PRs; never commit directly to `main`.
- Update this file in every engineering PR.
- Require CI, golden/snapshot tests and browser smoke tests before merge.
- Never lower a quality threshold to get a green workflow.
- Distinguish local/CI verification from production verification.
- Never claim production success without Cloudflare evidence and a real browser check.
- Never request passwords, API tokens or secret values in chat.

## Historical audit baseline — 2026-11-20 (superseded by the current assessment above)

Scores are preliminary engineering assessments from repository inspection, uploaded ZIP and available CI evidence, not production KPI measurements.

| Area | Score / 100 | Evidence / limitation |
|---|---:|---|
| Calculation accuracy | 72 | 55 calculator definitions and local tests; API coverage remains smaller |
| Performance | 68 | Existing mobile preview shows routes failing strict performance/TBT/LCP targets; runtime byte budget also failed locally |
| Interaction smoothness | 50 | Full interaction profiling and field INP remain unverified |
| SEO | 84 | Metadata and sitemap foundations exist; Search Console/GA4 outcomes not connected |
| AEO/GEO | 65 | AI contract and machine-readable content exist; external visibility unmeasured |
| Content quality | 55 | Value-content audit passes; 1,200+ original words per calculator not proven |
| Accessibility | 75 | Static audit passed; Lighthouse homepage accessibility previously scored 92 vs 95 |
| Security | 70 | CSP/auth/webhook tests exist; live service configuration remains unverified |
| Globalization | 32 | i18n foundation exists; country engines/localization remain limited |
| SaaS readiness | 35 | Worker/auth/D1/billing code exists; live lifecycle is unverified |

## Verified in uploaded ZIP / local runtime

- `npm test`: 48/48 passed on the supplied ZIP snapshot.
- `npm run build:dist`: passed on the supplied ZIP snapshot.
- 55 calculator definitions generated/copied; 117 HTML pages passed site integrity.
- Value-content audit: 55/55; static accessibility audit: 117 HTML pages.
- SaaS readiness, entitlement, privacy-safe analytics, billing webhook and Worker routing audits passed.
- Local `dist/` contained 248 public files; inspected forbidden internal paths were absent.
- `qa/performance-budget-audit.mjs` failed: calculator runtime was 129,214 bytes vs 118,000-byte budget.
- Local checks are not proof of the current GitHub head or production deployment.

## Verified in GitHub CI and production — 2026-11-22

Exact production main SHA: `b1610d10e5fe7d389140b20efdce6f63b6ef72e8` (merge commit for PR #138).

- PR #138 merged the ROI and Profit Margin zero-denominator correction. Zero investment cost / zero revenue are represented as undefined rather than misleading 0% ratios. UI, chart and PDF paths are covered; blank remains distinct from numeric zero.
- Current-main Unit Tests: **244/244 passed**. Canonical CI, Platform Gates, CodeQL, Cloudflare Worker deploy and Pages build/deploy passed on the exact main SHA.
- Current-main calculator browser smoke: **55/55 passed**, including click-only calculation, changed-input recalculation, min/max bounds and 375/768/1280px layouts. Static calculator shells: 55/55.
- Production browser smoke passed on `https://wealtharrays.com`: homepage, all registry calculators, Calculate/Compare interactions, shareable inputs, local save/load, PDF download and 375px overflow checks.
- Four production money pages (SIP, SWP, FIRE, Rent vs Buy) passed at 375/768/1280px. Eleven tested calculations stayed blank while editing and updated only after clicking Calculate.
- Production embed and homepage search smoke passed. Exact merge-SHA Cloudflare Worker build and runtime provenance matched before live smoke.
- Production deployment hygiene passed: all **241** manifest files reachable and **17** internal-path probes blocked. Production `/v1/health` returned a valid liveness response; this does **not** prove SaaS readiness.
- Strict production mobile Lighthouse: **7 routes × 3 runs = 21 runs**, all thresholds passed. Route medians: Performance 97–98, Accessibility 100, Best Practices 100, SEO 92; maximum observed CLS 0.0758, TBT 6.5 ms and LCP 2,350 ms. Emulated 360×800, DPR 2, 4× CPU slowdown and simulated slow 4G; this is lab evidence, not physical-device or field INP evidence.
- Lighthouse diagnostics: homepage normal baseline made zero Google Funding Choices requests; SWP CPU profile and observer probe were captured. No evidence justifies changing consent behavior based on Funding Choices.
- Evidence links: [merged PR #138](https://github.com/goyalalok565-byte/wealtharrays.github.io/pull/138), [production smoke run 45042953874](https://github.com/goyalalok565-byte/wealtharrays.github.io/actions/runs/45042953874), [mobile Lighthouse run 45042953831](https://github.com/goyalalok565-byte/wealtharrays.github.io/actions/runs/45042953831).

### Current quality assessment (engineering estimates, not global rankings)

| Area | Score / 100 | Basis and limitation |
|---|---:|---|
| Calculation accuracy | 82 | 55 browser calculators, 244 CI tests and independent vectors; legal/tax review remains external |
| Performance | 96 | Seven production routes passed strict three-run mobile lab gates; field Core Web Vitals remain unknown |
| Interaction smoothness | 85 | Production browser interactions pass; physical-device profiling and field INP remain unknown |
| SEO | 82 | Lighthouse SEO 92 and technical indexation contracts pass; non-brand search acquisition remains weak |
| AEO/GEO | 65 | Machine-readable contract exists; external answer-engine visibility is not an outcome guarantee |
| Content quality | 60 | 55/55 value-content checks; independent editorial/financial expert review and depth across all pages remain |
| Accessibility | 90 | Seven Lighthouse routes scored 100 and static gates pass; manual screen-reader/keyboard review remains |
| Security | 78 | CodeQL and platform security gates pass; live auth/billing configuration, abuse monitoring and legal privacy review remain |
| Globalization | 32 | Global structure exists; API exposes 20 models and country-specific engines/localization remain limited |
| SaaS readiness | 35 | Worker health liveness passes; D1, Supabase and Razorpay end-to-end activation is not verified |

### Search and monetization evidence

- Google Search Console, 2026-10-24 to 2026-11-20: 38 clicks, 96 impressions, 39.58% CTR and average position 11.88. 29 clicks came from the branded `wealth arrays` query; meaningful non-brand acquisition is not yet established. Search Console showed 16 countries with impressions; India supplied 38 clicks. This is an early baseline, not scale.
- The API model registry currently contains **20** models, not 55. Do not advertise full 55-model public API coverage.
- `ads.txt` publisher record exists, but AdSense approval, active publisher ad units, fill rate and earnings are not verified. A publisher record alone is not revenue.
- Razorpay checkout/webhook code exists, but D1, Supabase Auth, Razorpay plans/secrets, test-mode lifecycle, server-enforced paid entitlements and Paddle global seller/payout approval remain owner-side activation tasks.
- No revenue, global ranking, product-market fit, or number-one status is claimed.

### Phase 0 — status and remaining blockers

- **Engineering release gates:** passed for the current production SHA as listed above.
- **Tax terminology:** current TY 2026-27 wording uses Section 156; AY 2026-27 under the 1961 Act remains Section 87A. Formula/eligibility model has not been independently approved by a CA/lawyer. Obtain review before tax-product expansion or paid tax workflows.
- **Field performance:** connect/validate real-user Core Web Vitals and mobile INP; Lighthouse lab TBT is not INP.
- **Content and discovery:** grow non-brand topical authority with reviewed original content; measure Search Console query/page trends, indexing and conversion. Do not mass-generate thin pages.
- **SaaS and privacy:** keep account/cloud/billing features fail-closed until owner credentials, migrations, test checkout/webhooks, backup/restore, monitoring, deletion/export controls and DPDP review are complete.
- **Open PRs #88 and #97 are stale, diverged historical candidates; do not merge them.** PR #133 is an older docs-only candidate superseded by the current verification record. Dependency PRs #136/#137 require their own current-main review/CI and are not release blockers for the current product deployment.

## Current next actions

1. Owner: configure Cloudflare D1 + Worker bindings, Supabase Auth, Razorpay test plans/webhook and secrets directly in GitHub Settings; never share secret values in chat.
2. Owner: obtain CA/lawyer review for TY 2026-27 tax terminology, assumptions and eligibility language; confirm Paddle India payout and seller approval before global checkout.
3. Engineering: perform real-device accessibility/performance review, establish field INP/Core Web Vitals and privacy-safe product/conversion analytics.
4. Engineering: plan Phase 1 activation only after external setup and legal review; expand API beyond 20 models only with adapter equivalence and independent golden vectors.

## Phase 1 — blocked pending owner activation and legal review

Backend activation: Cloudflare Worker + D1, Supabase Auth, Razorpay test-mode subscriptions, server-side Free/Pro entitlements, backups, monitoring and error tracking.

Credential names only (never store values here):
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

Owner configures these directly in GitHub Settings > Secrets. Never request secret values in chat.

## Decisions

- India-first, global architecture; metadata-only country codes are not country engines.
- Preserve financial formulas unless authoritative reference vectors and tests justify a change.
- Historical decision: PR #88 was not a valid current-main release candidate; it is now stale/diverged and must not be merged.
- Do not alter ads/CMP based on one Lighthouse observation; profile first.
- Local `dist/` is not a substitute for production Cloudflare evidence.
- Never claim AdSense approval, traffic, revenue, rankings or SaaS activation without measurements.

PR #88 is a historical, stale/diverged candidate and has been superseded by changes merged through current main, including the verified PR #138 release. PR #97 is likewise stale/diverged; neither is an active release candidate.

## Next three actions

1. Owner: activate and verify D1, Supabase Auth and Razorpay test-mode subscriptions/webhooks/entitlements; keep features fail-closed until this is proven.
2. Owner: obtain CA/legal review of Tax Year 2026-27 terminology, assumptions and eligibility language; confirm Paddle seller/payout approval before global billing.
3. Engineering: add real-device accessibility/performance checks and privacy-safe field INP/Core Web Vitals analytics; expand public API only through equivalence-tested adapters.


## Owner decisions — 2026-11-20

- Payments: Razorpay India + Paddle global, subject to seller approval and India payout-route confirmation. Stripe is not default (India invite-only); Lemon Squeezy is winding down.
- Pricing test cells only after Pro MVP; no live tests now. Ultra waitlist-only.
- Pro trial 14 days, no card; Ultra 7-day invite-only beta, no card. Verified email, one trial per account, server-side D1 enforcement, idempotency and rate/risk controls. Combined refunds/chargebacks target <1% of paid transactions (internal target, not measured).
- Countries: India, US, UK, UAE, then Canada, Australia, Singapore.
- CA and lawyer review before Phase 1; owner will identify advisers.

## Snapshot baseline

PR #89 (merged) added 275 snapshots (55 calculators × default/zero/blank/large/invalid) and independent top-10 reference tests. The current-main verification in the section above supersedes the historical pending Platform Gates note.

PR #88's unmerged-head Cloudflare Worker build report is historical and is not current production evidence. Current exact-main Worker deployment, runtime provenance, Pages production smoke and API health liveness are recorded in the 2026-11-22 verification section above.


CI scope: strict seven-route Lighthouse runs on PR C (performance branch), manual dispatch and main-branch release validation. PR A/B run Canonical CI and Platform Gates plus the Lighthouse threshold unit tests; they do not run the performance measurement because they do not own performance changes. No thresholds are relaxed; PR C must pass the same strict limits.


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


## PR B — India tax-year terminology and sources

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

## CI runtime maintenance — pending verification

- Branch `chore/upgrade-github-actions-node24-2026-11-22` updates workflow action runtimes: `actions/checkout@v4 → @v5` (Node 24), `actions/setup-node@v4 → @v7` (Node 24), and `actions/upload-artifact@v4 → @v7`, including the pinned workflow-audit artifact action SHA.
- This addresses Node 20 deprecation warnings observed in the 2026-11-22 production and Lighthouse workflow logs.
- These are workflow dependency updates only; no product runtime, financial formula, threshold or deployment code is intentionally changed.
- Do not merge until the fresh current-main CodeQL, Canonical CI, Platform Gates, Unit Tests, workflow audit and calculator browser smoke checks pass. Recheck the resulting main SHA after merge.
