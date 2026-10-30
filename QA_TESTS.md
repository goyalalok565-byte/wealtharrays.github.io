# Wealth Arrays QA and release matrix

This document describes the current 47-calculator site and the QA gates wired into the repository. Older 20-calculator scenarios are historical and must not be treated as complete coverage of the current application.

## Current build and mandatory QA

The production build performs these steps:

1. Generate research datasets and any missing calculator route pages.
2. Generate canonical runtime bundles, 47 split calculator definitions, page-specific guidance, metadata and the indexable-only sitemap.
3. Apply premium layout and accessibility normalization, route alias/link repair and static integrity checks.
4. Build the dist deployment output and verify required public assets and all 47 split calculator definition scripts.
5. Run site integrity with SITE_ROOT=dist, value-content audit, SaaS readiness vectors, billing webhook audit, Worker syntax checks and Worker routing tests.

The current checks verify:

- 47 calculator definitions and 47 generated definition scripts are included in the build output.
- All 108 HTML pages pass site integrity; internal links, sitemap and robots references resolve.
- Every calculator has domain-specific guidance, a worked example, FAQs, internal article links, metadata and valid software/breadcrumb schema.
- API golden vectors cover the versioned server-side models, including SIP, EMI, GST, CAGR, compounding and zero-rate edge cases.
- The Indian new-regime tax engine has explicit tax-year, rebate and marginal-relief vectors. It is an estimate, not filing software.
- Worker route dispatch, static fallback, rate-limit enforcement and fail-closed behavior are tested.
- Razorpay webhook tests cover HMAC validation, duplicate delivery, stale event ordering, retryable unlinked subscription events and payment failure/refund event recording.

## Calculator math and release expectations

The full browser-side calculator library contains 47 calculators. The API currently exposes a smaller, separately versioned set of deterministic models; API model coverage must not be reported as 47/47 until each calculator has a reviewed adapter and independent golden vectors.

For each calculator, the release standard is:

- Independent reference equations and at least one worked golden vector.
- Zero-rate, empty, boundary, invalid and non-finite input handling where applicable.
- Unit clarity for monthly versus annual values and nominal versus real amounts.
- Result labels that distinguish contributed principal, growth, interest, tax and estimated totals.
- No unverified live rate, tax, lender or government-rule assumptions presented as current facts.

## Tax rule maintenance

The server-side India tax endpoint currently supports the new regime for Tax Year 2026-27 under the Income-tax Act, 2025. Keep the Tax Year label distinct from legacy Assessment Year terminology. Any rate, rebate, surcharge, cess or marginal-relief change must be checked against current CBDT/Income Tax Department material, versioned, and accompanied by boundary vectors before release.

## Production verification still required

A successful local build does not prove the production deployment is correct. These checks need access to the corresponding live services or devices:

- Cloudflare Pages deployment commit, build log, output directory, custom-domain routing and cache behavior.
- Cloudflare Worker deployment status, D1 migration state and secret/binding configuration.
- Real browser checks for all 47 calculator widgets, PDF/export/copy/embed flows, keyboard and screen-reader behavior, mobile layouts and console/network errors.
- Razorpay test-mode checkout, webhook delivery/retries, cancellation and refund reconciliation.
- Search Console indexing, query/page performance and GA4 conversion data.
- Core Web Vitals field data, backup/restore drills, monitoring/alerts and DPDP compliance review.

Do not mark any of these production checks as passed without direct evidence from the relevant service or browser.
