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
