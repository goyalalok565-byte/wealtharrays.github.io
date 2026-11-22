# Verification Ledger

Last updated: 2026-11-22

## Release protocol (mandatory)

### L1 — deployment confirmation before live smoke
After a main-touching merge, do not run live production smoke immediately. Poll for up to 15 minutes until the Cloudflare Workers Builds check named `Workers Builds: wealtharrays-github-io` is successful on the exact merge SHA, and the live HTML provenance marker `meta[name="wa-build-sha"]` equals that SHA. Only then run live smoke. If deployment or provenance is not confirmed before timeout, stop the line; do not classify it as a production defect and do not roll back.

### L2 — classify failures before rollback
- **Automation / verification failure:** workflow or smoke-script bug, missing test file, preview-only assertion, transient runner/Lighthouse trace failure, or deployment not yet complete. Stop subsequent merges; diagnose and fix the automation or wait for deployment. No rollback solely for this class.
- **Confirmed production failure:** only after L1 deployment confirmation, if live calculator pages fail to render, return 5xx, or lack their required static shell / `.calc-widget` host. Roll back promptly, then investigate.

Retrospective:
- **PR #115** (merge `cd33662e72d7cea324452ba8f5afeeb801524be2`, revert `5a836eebcd26201f10f0c503ad7b19c743e9169d`): the browser smoke used the local checked-out preview. It failed because the SIP calculator host lacked the `calc-widget` class; the Lighthouse job also failed with Chromium/Lighthouse `NO_NAVSTART` while recording the Rent vs Buy route. Neither log proves that a confirmed live deployment had a missing calculator or 5xx. Classification: preview/automation gate failure, not a confirmed production failure. Under this protocol, rollback was not justified by the available evidence.
- **PR #116** (merge `180ed103d879e4f802a29958667bf19dda62a59d`, revert `68f213880939dc749abaf987622fe90502fe9441`): post-merge smoke failed during the build step because `qa/static-calculator-shell-audit.mjs` was absent at the checked-out commit (`MODULE_NOT_FOUND`). Classification: automation/workflow failure. No live calculator failure was established; rollback was not justified by that evidence.

### L3 — live production verification job
A GitHub-runner job must wait for L1, then check these six URLs:
- `/`
- `/sip-calculator/`
- `/swp-calculator/`
- `/fire-calculator/`
- `/tools.html`
- `/articles/compound-interest-guide.html`

Every URL must return HTTP 200, expose `meta[name="wa-build-sha"]` equal to the merge SHA, and record `content-encoding` plus `cache-control` in the Actions job summary. Require `data-wa-static-shell` and a `.calc-widget` host on the three calculator routes (not on homepage, directory, or article routes, which are not calculator hosts). Brotli verification requires `content-encoding: br`.

### L4 — merge spacing and docs-only Workers builds
- After every main-touching merge, wait at least 30 minutes, or until deployment plus L1/L3 verification is complete, before another main-touching merge.
- Merge docs/test PRs individually, never as a batch. Stop the line after any failed required check.
- Cloudflare's official Workers Build watch-paths setting supports `path_includes` and `path_excludes`. Configure include `*` and exclude `docs/*` (or narrower approved documentation-only paths) in Workers & Pages → Worker → Settings → Build → Build watch paths. A docs-only push then skips the Worker build. Do not use an unverified `[skip ci]` commit-message convention.

## Current Phase 0 record
- PR #120 merged as `91ddc7ccaf4545b79e874b3dfdb69abec2897af4`.
- Exact-head strict Lighthouse: 7 routes × 3 runs; all medians passed. Main-vs-PR baseline job was skipped for the `release/phase0-clean-v4` branch, so a same-workflow BEFORE/AFTER comparison is not available for this merge.
- On the merge SHA, Cloudflare Workers Builds, Canonical, Platform, Unit Tests, Pages build/deploy, and API Worker deploy completed successfully. Unit Tests: 63/63.
- Merge-SHA `91ddc7c` has a successful Cloudflare Workers Builds check, but the commit predates the new HTML SHA marker. Therefore the strict L1 provenance match is not available for this merge; the legacy live smoke is not counted as L1/L3 evidence.
- The post-merge smoke run `44988086345` failed only at the deployment-hygiene redirect classifier (HTTP 302 on the configured `/qa/* -> /404.html` path); canonical runtime provenance and the calculator smoke steps before it passed. No live calculator render failure or 5xx was reported. Classification: automation/classifier failure, no rollback. PR #122 updates the checker to accept only the same-origin explicit noindex not-found page; rerun required before any further main merge.
- The legacy smoke began production checks after the Workers Build success but before exact merge-SHA HTML provenance was available. Treat it as transitional evidence, not full L1/L3 verification.


## Verified post-Phase-0 merges

### PR #124 — performance and live-verification protocol
- Merge SHA: `77602e4323893dfddea833363193027764decbae`.
- Pre-merge strict Lighthouse: 7 routes × 3 runs; all release thresholds passed. Exact-base comparison showed improved TBT medians on SIP (95→11 ms), SWP (108→49 ms), FIRE (83→14 ms), and Tools (140→94 ms). These are lab medians, not field data.
- Unit Tests: 63/63; Canonical, Platform, and Pages deployment passed.
- L1: Cloudflare Workers Builds succeeded on the exact merge SHA; live homepage provenance matched that SHA before smoke.
- L3 run `45022256810`: all six required routes returned HTTP 200; all six provenance markers matched; SIP/SWP/FIRE static shell and host checks passed; all six responses used Brotli; cache-control was recorded as `public, max-age=0, must-revalidate`.

### PR #100 — roadmap and calculation references
- Merge SHA: `1ae0dc04bb26325c3aa29a949cfa27b900019023`.
- Unit Tests: 63/63; Canonical, Platform, and build checks passed.
- L1: Cloudflare Workers Builds succeeded on the exact merge SHA; live homepage provenance matched before smoke.
- L3 run `45022653674`: all six required routes returned HTTP 200; all six provenance markers matched; SIP/SWP/FIRE static shell and host checks passed; all six responses used Brotli; cache-control was `public, max-age=0, must-revalidate`.

PR #100's first post-merge browser smoke run `45022653786` failed at the redirect classifier; this was an automation failure, not a calculator failure. After PR #129 fixed bounded same-origin redirect handling, production smoke run `45023440408` passed, including all 55 calculator routes, 375/768/1280px responsive checks on four money pages, 11 calculation interactions, 17 internal-path blocks, embed and search checks. The earlier post-merge Lighthouse run `45022653690` failed the strict TBT/LCP thresholds and triggered the performance follow-up.

### PR #129 — redirect-chain verification fix
- Merge SHA: `c9d610db723c26738976f0e1d0e4bdb5d49608da`.
- Unit Tests: 68/68; Canonical, Platform, build and deploy passed.
- L1/L3 run `45023440402`: exact merge SHA provenance matched; all six routes returned HTTP 200, Brotli and expected cache-control; calculator static shells passed.
- Production browser smoke run `45023440408`: PASS after the redirect-chain fix.
- Main live Lighthouse run `45023440383`: strict gate failed because Tools TBT median was 232 ms and SWP TBT median was 238 ms. Other five routes were within the TBT limit. This prompted PR #131.

### PR #131 — consent loading and accessibility
- Merge SHA: `570575f0e413858c1d2c6a07d1af0f303f03e8ca`.
- Unit Tests: 70/70; Canonical and Platform passed.
- Pre-merge exact-base Lighthouse: 7 routes × 3 runs; all strict thresholds passed. Candidate medians: Performance 98–100, TBT 0–64 ms, LCP 1,393–1,622 ms, Accessibility 100, CLS 0–0.076.
- L1/L3 run `45024585953`: exact merge SHA provenance matched; all six routes returned HTTP 200; SIP/SWP/FIRE static shell checks passed; Brotli and expected cache-control passed on all six.
- Post-merge production smoke and Lighthouse runs are pending; do not count them as passed until their final conclusions are available.

### Accepted Lighthouse SEO warning — Cloudflare Content Signals
- Production Lighthouse reports SEO 92 because Cloudflare's managed `robots.txt` adds the `Content-Signal` directive, which Lighthouse's robots.txt parser does not recognize. Keep the directive; it expresses the site's crawler/content-use policy and must not be removed merely to improve a lab score.
- Cloudflare's official documentation says Google Search Console may report `Syntax not understood` for Content Signals/newer directives, but reports no impact on crawling rates or SEO: https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/.

## PR #138 — ROI / Profit Margin zero-denominator correctness and current production verification

- Merge SHA: `b1610d10e5fe7d389140b20efdce6f63b6ef72e8`; merged 2026-11-22.
- Calculation behavior: zero investment cost and zero revenue now produce undefined ratios (displayed as an em dash) rather than false 0% ROI / margin. Blank inputs remain distinct from numeric zero. UI, chart, PDF, snapshots, independent references and browser regression coverage updated.
- Exact merge-SHA checks: Unit Tests **244/244**; CodeQL, Canonical CI, Platform Gates, Cloudflare Worker deploy and Pages build/deploy passed.
- L1 deployment: Cloudflare Workers Builds succeeded on the exact merge SHA. Production homepage, tools and SIP HTML carried the exact `wa-build-sha` marker; home/site/calculator runtime bundles matched canonical source-module provenance before live smoke.
- L3 live route verification: production verification workflow passed. Production `/v1/health` returned HTTP success with `status=ok`, correct service identity and API version. This is liveness only; it does not assert `ready_for_saas=true` or prove D1/Supabase/Razorpay activation.
- Production calculator browser smoke run `45042953874`: **55/55** canonical calculator pages passed. All 55 were tested for valid outputs, click-only calculation, changed-input recalculation, min/max bounds and 375/768/1280px layouts. Homepage, shareable inputs, local save/load, PDF download and 375px overflow checks passed.
- Four production money pages (SIP, SWP, FIRE, Rent vs Buy) passed 375/768/1280px responsive checks and 11 calculation interactions. Embed copy/flow and homepage calculator search passed.
- Deployment hygiene: **241/241** manifest files reachable, exact manifest commit deployed, **17/17** internal-path probes blocked. Production embed and homepage search smoke passed.
- Strict production Lighthouse run `45042953831`: **7 routes × 3 runs = 21 runs**, all median thresholds passed. Performance medians 97–98; Accessibility 100; Best Practices 100; SEO 92. Maximum observed CLS 0.0757403, TBT 6.5 ms, LCP 2,349.991 ms. Route medians:
  - Homepage: Performance 98, CLS 0, TBT 0 ms, LCP 2,083 ms.
  - Tools: Performance 97, CLS 0, TBT 0 ms, LCP 2,144 ms.
  - SIP: Performance 97, CLS 0.0757, TBT 0 ms, LCP 2,092 ms.
  - SWP: Performance 97, CLS 0.0757, TBT 1 ms, LCP 2,201 ms.
  - FIRE: Performance 97, CLS 0.0757, TBT 0 ms, LCP 1,929 ms.
  - Rent vs Buy: Performance 97, CLS 0.0700, TBT 0 ms, LCP 1,951 ms.
  - Compound Interest guide: Performance 98, CLS 0, TBT 0 ms, LCP 2,091 ms.
- Environment: 360×800 CSS px, DPR 2, 4× CPU slowdown, simulated slow 4G (150 ms RTT / 1,600 Kbps). Emulation is not a physical device. INP is not available in these lab reports and must be measured from real users.
- Diagnostics: homepage normal baseline made zero Google Funding Choices requests; no blocked-vs-normal comparison was justified. SWP CPU profile and MutationObserver probe were captured. Do not alter consent/CMP behavior based on an unobserved request.
- Evidence: [PR #138](https://github.com/goyalalok565-byte/wealtharrays.github.io/pull/138), [production smoke](https://github.com/goyalalok565-byte/wealtharrays.github.io/actions/runs/45042953874), [mobile Lighthouse](https://github.com/goyalalok565-byte/wealtharrays.github.io/actions/runs/45042953831).
- Remaining owner / external verification: configure and test D1, Supabase Auth, Razorpay test-mode lifecycle and server-side entitlements; obtain CA/legal review of TY 2026-27 tax wording; verify AdSense approval/ad-unit delivery and Paddle India seller/payout eligibility; establish real-user Core Web Vitals, INP, backups, alerts, and DPDP review. Do not infer revenue or SaaS readiness from this release.

