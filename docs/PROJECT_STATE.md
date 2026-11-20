# Wealth Arrays Project State

Last updated: 2026-11-20
Repository: `goyalalok565-byte/wealtharrays.github.io`
Default branch: `main`
Current phase: Phase 0 — Stabilization
Status: Phase 0 engineering changes are in review; strict performance targets and production evidence remain outstanding.

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

- PR #78 (`fix/calculator-widget-cls-reservation`) is open, not merged. Its canonical CI and Platform Gates passed at observed head `f501374fa678e251fd37364fac65601d3954b46e`; Mobile Lighthouse failed homepage accessibility (92 vs 95).
- PR #78 preview metrics under 4x CPU and simulated slow 4G: home Performance 97 / TBT 110ms / LCP 2.1s / CLS 0; tools 83 / 550ms / 2.5s / 0; SIP 90 / 260ms / 2.5s / .076; SWP 85 / 330ms / 3.0s / .076; FIRE 90 / 200ms / 2.5s / .076; Rent vs Buy 89 / 190ms / 2.6s / .070; compound guide 89 / 180ms / 3.0s / 0.
- Strict owner release targets are Performance >=90, CLS <=0.10, TBT <=200ms and LCP <=2.5s on all seven routes. Preview currently fails: tools, SIP and SWP TBT; SWP, rent-vs-buy and compound guide LCP; tools, rent-vs-buy and compound guide Performance.
- The earlier 7,510ms homepage TBT observation remains tracked until reproduced or current production remeasurement proves it resolved.
- Homepage Lighthouse findings are specific: low contrast on Quick EMI result label/output/meta text; target-size/overlap warnings around Scenario Lab CTA, calculator cards and category cards.
- Tools-page trace diagnosis from the 550ms TBT run: two `wa-site-runtime.js` long tasks at about 233ms each, plus Google Tag Manager (169ms), AdSense loader (162ms) and AdSense show-ads script (105ms). The current Tools page has no ad-slot markup. PR #84 now defers GA4 until explicit analytics consent, loads AdSense only when an actual slot exists, and scopes the visual runtime to calculator/embed routes; browser smoke coverage is added. Performance improvement is not yet measured.
- PR #81 (`docs/project-state-baseline-2026-11-20`) is open; its latest observed Platform Gates run was still in progress. Cloudflare bot posted a successful Worker build for its commit; that is not proof of a Pages production release.
- PR #82 (`fix/tax-year-aware-rebate-label`) is open and stacked on PR #81. Its local 50/50 tests and build passed on the ZIP-based worktree; GitHub CI had not started at last check. It changes only tax-year UI terminology, not calculations. CA/legal review remains required.
- PR #84 (`fix/phase0-release-gates-final`) is open against main and includes the CLS host fix, strict mobile release gates, homepage accessibility repairs, registry parity checks, a safe /v1/health endpoint and deployment inventory controls. Canonical CI, Platform Gates and Mobile Lighthouse passed the earlier code state but have not yet rerun against the latest consent/performance changes; no current-head pass is claimed.
- Earlier consolidated branch first verification run (commit `2886442`) passed Canonical CI. Platform Gates confirmed registry parity and the 249-file dist inventory (247 public assets + 2 Cloudflare config files), then stopped on a literal newline typo in the new Worker health test. Mobile Lighthouse stopped at the negative-test suite because `null` TBT was treated as zero; the gate now fails closed on missing CLS/TBT/LCP metrics, and the routing-test newline is corrected. These corrections still require a fresh CI run.

## Phase 0 — status and open items

1. **P0-1 Calculator CLS:** PR #78 adds the missing `.calc-widget` host class and static reservation. Do not merge until strict release gates and browser regressions pass.
2. **P0-2 Performance gates:** This PR adds strict numeric checks for Performance >=90, CLS <=0.10, TBT <=200ms and LCP <=2500ms, retaining accessibility >=95, best practices >=80 and SEO >=90. Tests must prove a threshold violation fails. The current preview is expected to fail until performance is improved; never relax thresholds.
3. **P0-3 Tax terminology:** PR #83 now includes the Tax Year 2026-27 widget wording update to Section 156 plus source/runtime regression coverage and build audit. No formula or eligibility logic changed. CA/legal review is still a release prerequisite.
4. **P0-4 Registry source of truth:** PR #83 removes stale 47/55 workflow labels and adds a registry audit across calculator pages, split definitions, homepage, tools, search, sitemap, `llms.txt`, methodology and metadata. Build/CI verification is pending.
5. **P0-5 Health and monitoring:** PR #83 adds `GET /v1/health` with API version, liveness, D1 probe, Supabase/Razorpay/rate-limiter readiness flags, no secret values, OpenAPI docs and Worker routing regression tests. Monitoring integration and CI verification remain pending.
6. **P0-6 Deployment hygiene:** PR #83 adds a shared exclusion policy for QA, scripts, docs, tests, workflows, backups and archives; a deterministic public-file manifest; local dist inventory audit; and a production check that probes internal paths and HEAD-checks manifest files. CI and post-deploy verification remain pending.

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
- Do not merge PR #78 until strict mobile thresholds, accessibility and browser checks pass.
- Do not alter ads/CMP based on one Lighthouse observation; profile first.
- Local `dist/` is not a substitute for production Cloudflare evidence.
- Never claim AdSense approval, traffic, revenue, rankings or SaaS activation without measurements.

## Next three actions

1. Trigger fresh CI on the latest consolidated branch; verify the tax, health, registry, dist and consent-aware browser tests, then inspect the new seven-route Lighthouse and SWP CPU artifacts.
2. Optimize remaining route-level performance failures based on the new traces, while keeping all release thresholds unchanged.
3. Verify the deployed public-file manifest and `/v1/health` after a production release, measure Core Web Vitals, and obtain CA/legal review of tax eligibility wording.
