# Verification Ledger

Last updated: 2026-11-22

## Current release pointer
The latest verified production release is PR #138, merge SHA `b1610d10e5fe7d389140b20efdce6f63b6ef72e8`. See the PR #138 entry at the end of this ledger. All earlier release records below are historical.

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

## Historical Phase 0 record — PR #120 (superseded by PR #138)
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
- At the time of this historical entry, post-merge production smoke and Lighthouse runs were pending. The later PR #138 release has its own complete production evidence below.

### Accepted Lighthouse SEO warning — Cloudflare Content Signals
- Production Lighthouse reports SEO 92 because Cloudflare's managed `robots.txt` adds the `Content-Signal` directive, which Lighthouse's robots.txt parser does not recognize. Keep the directive; it expresses the site's crawler/content-use policy and must not be removed merely to improve a lab score.
- Cloudflare's official documentation says Google Search Console may report `Syntax not understood` for Content Signals/newer directives, but reports no impact on crawling rates or SEO: https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/.

## PR #138 — zero-denominator financial ratios and production release

- Merge SHA: `b1610d10e5fe7d389140b20efdce6f63b6ef72e8`.
- PR #138 was replayed onto the then-current main SHA `fc26bc155fe8988965bc664aa43158f2832c5c5e` before merge; its fresh-main checks passed.
- Pre-merge: 70/70 Unit Tests, 55/55 calculator browser smoke, Canonical CI, Platform Gates, CodeQL and Cloudflare Workers Builds passed. PR Lighthouse was skipped because this was a correctness-only change; production Lighthouse was run after deployment.
- Zero investment cost now yields undefined ROI and annualized ROI, not 0%. Zero revenue yields undefined gross/net margin, not 0%. UI, charts and PDF exports display an em dash. Blank values remain distinct from numeric zero.
- L1/L3 production verification run `45042953840`: exact merge-SHA HTML provenance matched; all six required routes returned HTTP 200; SIP/SWP/FIRE static shells passed; all six responses used Brotli and cache-control `public, max-age=0, must-revalidate`.
- Post-stabilization production browser smoke run `45042953874`: PASS. Homepage search, embeds, all 55 canonical calculator pages, visual/calculation checks, four production money-page responsive/calculation checks, deployment-manifest/internal-path exclusions, production embed, homepage search and production visual/calculator checks passed.
- Production mobile Lighthouse run `45042953831`: seven routes × three runs; strict medians passed. Performance 97–98, Accessibility 100, Best Practices 100, SEO 92; maximum median CLS 0.076, TBT 1 ms, LCP 2,201 ms.
- SEO 92 is the accepted Cloudflare-managed Content Signals parser warning above; do not remove the managed directive to chase a lab score.
- The separate GitHub API Worker deployment workflow run `45042922460` completed its workflow but explicitly reported **Worker deployment NOT performed** because `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_D1_DATABASE_ID` were absent. It also reported Supabase and Razorpay runtime variables missing. Cloudflare's native Workers Builds check and exact live HTML provenance did pass. Do not interpret the static/live-site checks as proof that D1, Supabase Auth or Razorpay billing is ready.
- `GET /v1/health` and the 15-minute health-monitor workflow exist; the post-release scheduled health-monitor result still needs to be recorded. SaaS readiness remains unverified until the health endpoint reports D1, Supabase, Razorpay and rate-limiter readiness.
