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
