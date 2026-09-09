# Wealth Arrays — Phase 10 Production Hardening Audit

Phase 10 is the production-hardening phase: reliability, privacy boundaries, deterministic QA, security policy, caching, voice/mobile criteria, and release truth.

## Completed in source

### Pass 1 — Live permissions
- Microphone policy allows same-origin voice input.
- Camera, geolocation, payment and USB remain blocked.

### Pass 2 — Analytics measurement
- GA4 interaction tracking is consent-aware.
- Calculator analytics starts after the first valid calculation.
- Financial values, balances, income figures and other raw calculator inputs are not used as analytics event parameters.

### Pass 3 — Product event coverage
Tracked after analytics consent:
- calculator_calculated
- calculator_compare_open
- calculator_share
- calculator_export
- calculator_embed_copy
- tool_search_select
- currency_change
- theme_change

### Pass 4 — Privacy boundary
- Smart Calculator Intelligence is local-first and deterministic.
- `smart.js` contains no `fetch`, `XMLHttpRequest`, or `sendBeacon` path for financial inputs.
- The production QA workflow checks this boundary.

### Pass 5 — Performance caching
- Static CSS, JavaScript, SVG and manifest resources have explicit short caching with stale-while-revalidate in `_headers`.
- HTML is configured for revalidation rather than long-lived caching.
- The repository has no Google Fonts network dependency.

### Pass 6 — Security policy
- `_headers` now defines MIME sniffing protection, strict referrer policy, Permissions Policy, same-origin framing and a restrictive Content Security Policy.
- The CSP allows only same-origin executable JavaScript plus the fixed hash used by the theme bootstrap.

### Pass 7 — Deterministic calculator QA
- Added `scripts/phase10-qa.mjs`.
- All 20 calculator definitions are covered by deterministic scenarios.
- The runner validates expected outputs, finite results, unique IDs and basic field-definition integrity.
- The Phase 10 GitHub Actions workflow runs this test on pushes and pull requests to `main`.

### Pass 8 — Mobile / voice / release criteria
Release criteria remain:
- no horizontal overflow
- usable touch targets
- calculator inputs remain visible and keyboard-friendly
- comparison remains usable on narrow screens
- charts show an explicit empty state instead of a fake graph
- supported browsers expose voice input only when browser capability and permission exist

## Deployment truth

The repository's visible GitHub Actions production deployment is **GitHub Pages**. The `_headers` file is also maintained for Cloudflare Pages/edge serving, but GitHub Pages itself does not consume Cloudflare Pages `_headers` rules. Therefore source-level header hardening is complete, while the actual HTTP response headers must be verified at whichever service is serving `wealtharrays.com`.

## User-owned / account-level checks

These cannot be truthfully completed from repository access alone:
1. Confirm the final HTTP response headers on the production custom domain.
2. Confirm CDN/cache behavior at the active serving layer.
3. Google Search Console indexing and Coverage reports.
4. Google Analytics property/admin settings and Realtime reports.
5. AdSense application, identity/payment verification and policy review.
6. Physical-device testing on the user's own Android/iPhone hardware.

## Recommended final production smoke test

1. Open one calculator on desktop Chrome and make a valid calculation.
2. Verify Smart Assist appears and stays local.
3. Test voice input where supported and permission is granted.
4. Test Compare, Share and Export after a valid calculation.
5. Check homepage and one calculator at narrow mobile width.
6. Verify the actual production response headers at `wealtharrays.com`.
7. Run PageSpeed Insights on the homepage and one calculator URL.
