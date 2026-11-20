# Wealth Arrays Project State

Last updated: 2026-11-20
Repository: `goyalalok565-byte/wealtharrays.github.io`
Default branch: `main`
Current phase: Phase 0 — Stabilization
Status: Audit baseline recorded; no Phase 0 production fixes are certified complete.

## Mission

Build Wealth Arrays into a trusted global financial intelligence and calculator SaaS platform. The product is organized around five pillars:

1. Calculation Engine — deterministic, reproducible calculations with versioned formulas and golden tests.
2. Financial Intelligence — decision comparisons, scenario analysis, sensitivity and goal planning.
3. SaaS Workspace — accounts, saved calculations, goals, reports and transparent entitlements.
4. Developer Platform — versioned public API, embeddable tools and developer documentation.
5. Global Financial Infrastructure — jurisdiction-specific engines, currencies, number formats and reviewed localization.

Trust, accuracy, privacy and measurable quality take precedence over growth claims. AI may select and explain deterministic models but must never invent financial numbers or tax rules.

## Architecture

- Static website is built from the repository and deployed through Cloudflare Pages.
- `scripts/build-dist.mjs` creates the public `dist/` output.
- `calculators.js` is the source registry; `scripts/root-cause-build.mjs` generates 55 split calculator definitions, calculator pages, runtime bundles, route metadata and sitemap entries.
- `wa-calculator-runtime.js` is the calculator-page runtime entry point.
- `financial-engine.js`, `formula-registry.js` and `decision-adapters.js` provide deterministic scenario and decision foundations.
- `worker.mjs` routes `/v1/*` requests to Cloudflare Worker modules; `wrangler.toml` declares the Worker, static asset binding and rate limiter.
- Backend code includes Supabase authentication, D1 scenario storage, Razorpay subscription/webhook handlers and entitlement checks. These remain fail-closed until external configuration is complete.
- API model coverage is smaller than the 55 browser calculators (briefing baseline: 11 models); country parameter is not yet a full country-engine implementation.
- Current country-specific tax implementation is India Tax Year 2026-27. Never infer tax rules without approved source provenance and effective dates.

## Current phase and release discipline

Phase 0 must be completed before Phase 1–5 work, unless the owner explicitly changes the order.

- Use small pull requests; do not commit directly to `main`.
- Every PR updates this file.
- Require CI, golden/snapshot tests and browser smoke tests before merge.
- Never lower a quality threshold to obtain a green workflow.
- Distinguish local/CI verification from production verification.
- Never change a financial formula without an authoritative reference calculation, a regression test and a one-line explanation.
- Do not claim production success without evidence from Cloudflare or a real browser against production.

## Audit baseline — 2026-11-20

Scores are preliminary engineering assessments from repository inspection, uploaded project ZIP and available CI evidence; they are not production KPI measurements.

| Area | Score / 100 | Evidence / limitation |
|---|---:|---|
| Calculation accuracy | 72 | 55 definitions and 48 tests; API coverage remains limited and one tax UI label is inconsistent |
| Performance | 68 | CLS host mismatch on main; strict requested gates absent; runtime size budget currently fails |
| Interaction smoothness | 50 | INP and full interaction profiling remain unverified |
| SEO | 84 | Metadata/sitemap foundations and lab SEO checks exist; GSC/GA4 are not connected |
| AEO/GEO | 65 | AI contract and machine-readable content exist; external visibility is unmeasured |
| Content quality | 55 | Current 55/55 value-content audit passes; owner target of 1,200+ original words per calculator is not proven |
| Accessibility | 75 | Static audit passes; latest PR Lighthouse gate failed homepage accessibility at 92 vs 95 |
| Security | 70 | CSP, auth and webhook tests exist; live service configuration and production security remain unverified |
| Globalization | 32 | i18n foundation exists; country engines/localization remain limited |
| SaaS readiness | 35 | Worker/auth/D1/billing code exists; live end-to-end activation is unverified |

### Verified in uploaded ZIP / local runtime

- `npm test`: 48/48 tests passed.
- `npm run build:dist`: passed.
- Build generated and copied 55 calculator definitions.
- Site integrity: 117 HTML pages passed.
- Value-content audit: 55/55 passed.
- SaaS readiness, entitlement, privacy-safe analytics, billing webhook and Worker routing audits passed as part of the build.
- Accessibility static audit: 117 HTML pages passed.
- Platform phase 1–20 and roadmap audits passed.
- Local `dist/` inventory: 248 public files; no QA, scripts, tests, docs, Markdown or ZIP/backup path matched the inspected forbidden-path patterns.
- `qa/performance-budget-audit.mjs`: failed because `wa-calculator-runtime.js` is 129,214 bytes, above the 118,000-byte route-runtime budget.

### Verified in GitHub CI

- Open PR #78 exists: calculator host CLS reservation.
- Its latest observed head commit: `f501374fa678e251fd37364fac65601d3954b46e`.
- Canonical CI: passed.
- Platform Gates: passed.
- Mobile Lighthouse Quality Gate: failed because homepage accessibility scored 92 against the current minimum of 95.
- Actual seven-route PR preview artifact (4x CPU, simulated slow 4G): homepage Performance 97 / TBT 110 ms / LCP 2.1 s / CLS 0; tools 83 / 550 ms / 2.5 s / 0; SIP 90 / 260 ms / 2.5 s / 0.076; SWP 85 / 330 ms / 3.0 s / 0.076; FIRE 90 / 200 ms / 2.5 s / 0.076; Rent vs Buy 89 / 190 ms / 2.6 s / 0.070; compound guide 89 / 180 ms / 3.0 s / 0.
- Latest Lighthouse quality gate failed: homepage accessibility 92 vs minimum 95. The current PR's gate only enforces Performance >=70, CLS <=0.25, Accessibility >=95, Best Practices >=80 and SEO >=90; it does not enforce the owner's stricter Performance >=90, CLS <=0.10, TBT <=200 ms and LCP <=2.5 s.
- Under the stricter targets, tools, SIP and SWP fail TBT; SWP, rent-vs-buy and the compound-interest guide fail LCP; tools/rent-vs-buy/compound guide fail Performance. The CLS reservation itself is improved in the PR preview.
- This does not erase the earlier 7,510 ms production observation; the current preview homepage is below 200 ms, but the earlier production outlier must remain tracked until reproduced or production remeasurement confirms it is resolved.
- PR #78 is not merged and must not be merged until all requested stricter gates and browser regressions pass.

### Not verified on production

- Cloudflare Pages deployed commit, build log, actual deployed file inventory and custom-domain output.
- Cloudflare Worker live status, D1 migration state and /v1 endpoint behavior.
- Live Supabase authentication, cloud scenario persistence and Razorpay test-mode lifecycle.
- Real-user INP/Core Web Vitals, Search Console/GA4 outcomes, and live accessibility checks.

## Phase 0 — open items

1. **P0-1 Calculator CLS:** Main branch calculator host markup lacks the `.calc-widget` class required by the 520px reservation rule. PR #78 proposes the fix; do not merge until its complete release gate passes.
2. **P0-2 Performance gates:** Add enforceable mobile thresholds: Performance >= 90, CLS <= 0.10, TBT <= 200 ms and LCP <= 2.5 s. Add tests proving threshold violations fail. Measure the same core route matrix on the built PR preview. Do not substitute TBT for INP.
3. **P0-3 Tax terminology:** UI wording is updated in PR #82 (`fix/tax-year-aware-rebate-label`) to Section 156 and Tax Year 2026-27; regression coverage checks both source and generated runtime. Local tests/build pass; GitHub CI is pending. No tax calculation or eligibility logic changed. CA/legal review remains required before release. The FY/Tax Year 2026-27 widget in `widget.js` and generated runtime still labels rebate eligibility as Section 87A, while API/docs refer to Section 156. Use year-aware statutory terminology. Income Tax Department Section 156 text and Gazette support Section 156 for the 2025 Act tax year; legacy AY 2026-27 guidance still references Section 87A. CA/legal review is required for user-facing eligibility interpretation; no tax computation change is authorized by this label fix.
4. **P0-4 Registry source of truth:** Remove stale “47 calculators” workflow labels/scripts. Derive counts and calculator lists from `calculators.js` across pages, navigation, sitemap, `llms.txt`, metadata, workflows and tests.
5. **P0-5 Health and monitoring:** Add secure `GET /v1/health` with status, version and safe dependency checks, no secret disclosure, tests and monitoring.
6. **P0-6 Deployment hygiene:** Explicitly exclude internal QA, scripts, docs, tests, workflows, Markdown, backups and archives from Pages output. Local `dist/` is clean under current checks; production deployed file inventory is still required.

## Phase 1 — blocked pending Phase 0

Backend activation: Cloudflare Worker + D1, Supabase Auth, Razorpay test-mode subscriptions, server-side Free/Pro entitlements, backups, monitoring and error tracking.

Credential checklist (names only; never store values here):
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

Owner supplies/configures secrets directly in GitHub Settings. Never request secret values in chat.

## Decisions

- India-first, global architecture; do not represent a metadata-only country parameter as a country engine.
- Preserve existing financial formulas unless reference vectors and tests justify a change.
- Do not merge PR #78 until the new strict performance gates, accessibility gate and full browser checks pass.
- Do not modify ad/CMP behavior based only on a single Lighthouse observation; profile first-party work.
- Local `dist/` verification is not a substitute for production Cloudflare evidence.
- Never claim AdSense approval, traffic growth, revenue, rankings or SaaS activation without measured evidence.

## Next three actions

1. Complete P0-1/P0-2 performance stabilization: profile the homepage long task, fix CLS host reservation, enforce the strict mobile gate and repair the current accessibility failure without weakening thresholds.
2. Fix P0-3 tax terminology with a tax-year-aware UI label and regression test; obtain CA/legal review of eligibility language before release.
3. Complete P0-4/P0-6 registry and deployment-output hygiene, then add P0-5 health endpoint and monitoring before Phase 1.
