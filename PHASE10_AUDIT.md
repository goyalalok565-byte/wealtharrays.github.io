# Wealth Arrays — Phase 10 Production Hardening Audit

Phase 10 focuses on live-product reliability rather than adding decorative features.

## Pass 1 — Live permissions
- Microphone policy corrected to allow same-origin voice input.
- Camera, geolocation, payment and USB remain blocked.

## Pass 2 — Analytics measurement
- GA4 interaction tracking is consent-aware.
- No calculator values, balances, income figures or other financial inputs are sent as analytics event parameters.

## Pass 3 — Product event coverage
Tracked after analytics consent:
- calculator_calculated (first valid calculation per page session)
- calculator_compare_open
- calculator_share
- calculator_export
- calculator_embed_copy
- tool_search_select
- currency_change
- theme_change

## Pass 4 — Privacy boundary
Financial inputs remain out of event payloads. Analytics only receives feature/category identifiers needed for product measurement.

## Pass 5 — Performance caching
Static CSS and JavaScript receive short CDN/browser caching with stale-while-revalidate. HTML remains revalidated.

## Pass 6 — Voice UX hardening
Voice input still depends on browser support and microphone permission. Unsupported browsers show a disabled control rather than pretending the feature works.

## Pass 7 — Mobile/reliability criteria
Release criteria remain:
- no horizontal overflow
- usable touch targets
- calculator inputs remain visible and keyboard-friendly
- comparison remains usable on narrow screens
- charts must show an explicit empty state instead of a fake graph

Physical-device testing is still required for Safari/iPhone and Android browser differences.

## Pass 8 — Release truth check
Completed source-level hardening does not guarantee Google rankings, AdSense approval, browser microphone support, or financial outcomes. Those claims would be false.

## User-owned production tasks
These cannot be completed from the repository:
1. Cloudflare Pages deployment status and cache behavior in the user's account.
2. Google Search Console indexing requests and Coverage reports.
3. Google Analytics property/admin settings and reports.
4. AdSense application, identity/payment verification and policy review.
5. Real-device testing on the user's own Android/iPhone devices.

## Recommended next production check
After deployment, verify in this order:
1. Voice input asks for microphone permission and works on a supported Chrome browser.
2. Accept analytics, make one calculation, then confirm Realtime activity.
3. Use Compare, Share and Export once.
4. Check homepage and one calculator in mobile portrait mode.
5. Run PageSpeed Insights on the homepage and one calculator URL.
