# Wealth Arrays Project State

Last updated: 2026-11-20
Repository: `goyalalok565-byte/wealtharrays.github.io`
Default branch: `main`
Current phase: Phase 0 — Stabilization
Status: Phase 0 engineering changes are in final verification review; strict performance targets and production evidence remain outstanding.

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

## Audit baseline — 2026-11-20

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

## Verified in GitHub CI / PR previews

- PR #78 was closed without merging as superseded by the consolidated PR #88. Its earlier seven-route mobile preview remains the known baseline: multiple routes missed strict performance, TBT or LCP targets; homepage accessibility scored 92 vs the 95 floor.
- PRs #81–#87 are historical/superseded engineering or verification branches. PR #87 was closed without merging because it was based on a stale mainline.
- **Active release candidate:** PR #88, branch `fix/phase0-clean-mainline-2026-11-20`, based on the current `main` branch. GitHub reports the branch mergeable; this is not equivalent to release approval.
- The previous documentation-only verification head was `41583eda808d2fb6c42caa3cdd09261a35264670`. Subsequent ad-slot-aware loading fixes are being committed; re-check the latest head and its fresh CI before relying on results.
- On that PR run, **Canonical CI passed**: source/Pages/Worker syntax, privacy and auth CSP regression, privacy policy, calculator regression and independent formula audit, generated routes/runtime, Section 156 terminology, canonical embed regression and regression gates.
- **Platform Gates passed**: registry parity, 55-calculator catalogue audit, Phase 1–20 audits, research data audit, static accessibility audit, production `dist` build, deployment exclusion and exact manifest audit, dist integrity, literal `npm run build`, minification and production asset budget.
- On the latest completed browser run before the ad-slot fix, the PR preview built; canonical calculator embed, all-registry/scenario smoke, all 55 calculators across responsive layouts/currency/theme/language/exports, and authenticated cloud workspace save/load all passed. The third-party loading smoke failed because `/tools.html` loaded the AdSense library despite having no ad slot. This correctly blocked the workflow; seven-page Lighthouse, homepage TBT diagnosis, SWP CPU profile and strict threshold enforcement were skipped. The fix now makes the build inject AdSense only on eligible pages containing a real `ins.adsbygoogle[data-ad-slot]` placement and removes ad-network preconnects when no slot exists. Fresh CI and browser verification are pending; no seven-route Lighthouse pass is claimed.
- Strict owner release targets remain unchanged on all seven routes: Performance >=90, CLS <=0.10, TBT <=200ms and LCP <=2.5s; accessibility >=95, best practices >=80 and SEO >=90. The earlier baseline failed multiple targets. Do not relax gates.
- Prior trace evidence found expensive `wa-site-runtime.js`, GTM and AdSense work on Tools; the release candidate defers GA4 until explicit analytics consent, now gates AdSense and ad-network preconnects on actual ad slots, and scopes visual runtime to calculator/embed routes. Fresh browser and performance measurements must still prove the benefit.
- Production deployment, live Cloudflare file manifest, live `/v1/health`, production Core Web Vitals, AdSense approval, and CA/legal review are **not verified**.

## Phase 0 — status and open items

1. **P0-1 Calculator CLS:** PR #88 carries the missing `.calc-widget` host class and static reservation. Do not merge until strict release gates and browser regressions pass.
2. **P0-2 Performance gates:** This PR adds strict numeric checks for Performance >=90, CLS <=0.10, TBT <=200ms and LCP <=2500ms, retaining accessibility >=95, best practices >=80 and SEO >=90. Tests must prove a threshold violation fails. The current preview is expected to fail until performance is improved; never relax thresholds.
3. **P0-3 Tax terminology:** PR #88 includes the Tax Year 2026-27 widget wording update to Section 156 plus source/runtime regression coverage and build audit. No formula or eligibility logic changed. CA/legal review is still a release prerequisite.
4. **P0-4 Registry source of truth:** PR #88 removes stale 47/55 workflow labels and adds a registry audit across calculator pages, split definitions, homepage, tools, search, sitemap, `llms.txt`, methodology and metadata. The previous Platform Gates run passed; revalidation is pending for the latest ad-loading fix.
5. **P0-5 Health and monitoring:** PR #88 adds `GET /v1/health` with API version, liveness, D1 probe, Supabase/Razorpay/rate-limiter readiness flags, `ready_for_saas`, no secret values, OpenAPI docs and Worker routing regression tests. A 15-minute GitHub Actions health monitor and post-deploy health check are included; live monitoring starts only after deployment.
6. **P0-6 Deployment hygiene:** PR #88 adds a shared exclusion policy for QA, scripts, docs, tests, workflows, bundled source-only runtime modules, backups and archives; a deterministic public-file manifest; local dist inventory audit; and a production check that probes internal paths and HEAD-checks manifest files. The previous Platform Gates run passed; fresh CI and post-deploy verification remain pending.

## Phase 1 — blocked pending Phase 0

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
- Do not merge PR #88 until strict mobile thresholds, accessibility and browser checks pass.
- Do not alter ads/CMP based on one Lighthouse observation; profile first.
- Local `dist/` is not a substitute for production Cloudflare evidence.
- Never claim AdSense approval, traffic, revenue, rankings or SaaS activation without measurements.

Active verification PR: #88 (`fix/phase0-clean-mainline-2026-11-20`), based on current `main`. This branch consolidates the CLS, tax terminology, strict performance gates, registry parity, health monitor, deployment hygiene and ad-slot-aware third-party loading work. Do not merge until the seven-route release matrix passes.

## Next three actions

1. Re-run canonical CI, Platform Gates and the full PR #88 browser suite after the AdSense slot-detection fix; confirm consent, no-slot pages and any future slot-bearing page behavior.
2. Complete seven-route mobile Lighthouse, homepage TBT diagnosis and SWP CPU profiling; fix measured route-level failures without changing release thresholds and rerun all checks on the final head.
3. Only after the seven-route release matrix passes, review and merge PR #88, verify the Cloudflare deployment manifest and `/v1/health`, measure production Core Web Vitals, and obtain CA/legal review of tax eligibility wording.


## Owner decisions — 2026-11-20

- Payments: Razorpay India + Paddle global, subject to seller approval and India payout-route confirmation. Stripe is not default (India invite-only); Lemon Squeezy is winding down.
- Pricing test cells only after Pro MVP; no live tests now. Ultra waitlist-only.
- Pro trial 14 days, no card; Ultra 7-day invite-only beta, no card. Verified email, one trial per account, server-side D1 enforcement, idempotency and rate/risk controls. Combined refunds/chargebacks target <1% of paid transactions (internal target, not measured).
- Countries: India, US, UK, UAE, then Canada, Australia, Singapore.
- CA and lawyer review before Phase 1; owner will identify advisers.

## Snapshot baseline

PR #89 (merged) adds 275 snapshots (55 calculators × default/zero/blank/large/invalid) and independent top-10 reference tests. Canonical CI passed; Platform Gates status pending recheck. These snapshots lock current behaviour, not correctness by themselves.

PR #88 Cloudflare bot reported a successful Worker deployment from unmerged head 6221a1b with a `/production/builds/` dashboard record. Treat as production Worker deployment report. Pages and live `/v1/health` remain unverified.


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


## PR C — static shell and trace-led performance

- Build-time shell generation targets every calculator in the canonical registry (currently 55). It includes labels, editable inputs, a result region, a 220px fixed chart placeholder and a 520px minimum-height shell. The canonical runtime hydrates/replaces the shell when JavaScript is enabled.
- QA: source audit across all registry routes plus Playwright browser smoke with JavaScript disabled.
- PR #88 Lighthouse trace artifact: https://github.com/goyalalok565-byte/wealtharrays.github.io/actions/runs/44679593076/artifacts/14604350761 . Failed LCP: SWP 2,656ms, rent-vs-buy 2,611ms, compound-interest article 2,553ms (strict limit 2,500ms). LCP candidates were text elements (SWP description paragraph, rent-vs-buy H1, article H1); element-render delays were about 134ms, 87ms and 132ms. A shared long JS task is not established as the common cause.
- Compound-interest article had a versioned preloaded root stylesheet and a second unversioned relative stylesheet request; the report counted 196,315 CSS transfer bytes versus about 101,653 bytes on calculator routes. PR C reuses the exact preloaded URL and adds an audit to prevent duplicate transfer.
- Lighthouse reported ~67KiB unused CSS and ~66KiB unused calculator runtime JS on affected routes; these remain optimization leads, not proven sole causes. No blanket script deferral or CSS rewrite is claimed.
- PR #88 preview homepage TBT was 0ms; blocking Funding Choices also measured 0ms. A same-settings main-branch comparison has not been run, so historical 7,510ms-to-current remains unverified.
- Strict seven-route thresholds remain unchanged: Performance >=90, CLS <=0.10, TBT <=200ms, LCP <=2,500ms, Accessibility >=95, Best Practices >=80, SEO >=90. PR C must pass fresh seven-route CI; no pass is claimed yet.


## Cloudflare Workers production-branch control — verified incident

- PR #88 bot deployment comment reports successful production deployment for unmerged head `6221a1b4` at 05:14 UTC: https://dash.cloudflare.com/?to=/f5619318297695cabb3a1540854cb166/workers/services/view/wealtharrays-github-io/production/builds/dafa123a-596b-481b-96ae-53f8e2fbc029 .
- PR #93 bot deployment comment also reports successful production deployment for unmerged head `20de71f1` at 06:13 UTC: https://dash.cloudflare.com/?to=/f5619318297695cabb3a1540854cb166/workers/services/view/wealtharrays-github-io/production/builds/dfb200ba-8f7c-40cc-994c-2fb21b759d73 .
- These are production-build/deployment bot records, not Preview URLs. Current active version/traffic percentage and Pages production deployment are not verified from the repository.
- Cloudflare Worker Settings → Build → Branch control must be checked. The production branch should be `main`; enable Worker Previews for non-production branches and use the Preview command (`npx wrangler preview`). If this Worker is still on legacy branch-build mode, complete the one-time switch to Worker Previews. Official docs: https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/ and https://developers.cloudflare.com/workers/ci-cd/builds/configuration/ .
- Dashboard rollback: Workers & Pages → Worker → Deployments → three-dot menu on last-known-good version → Rollback. Rollback routes 100% traffic to that version; D1/KV/R2/DO resources are not rolled back and must be checked separately. Official: https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/ .
