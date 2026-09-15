# Wealth Arrays — Production Architecture

## Runtime ownership

- `wa-calculator-runtime.js` is the **only calculator-page body runtime entry point**.
- `theme-init.js` remains a head bootstrap because theme state must be applied before first paint.
- `404-runtime.js` is isolated to `404.html`.
- `sw.js` owns service-worker lifecycle/cache behavior.
- `manifest.webmanifest` owns install metadata.

## Source ownership

The canonical calculator runtime has **13 versioned source modules** in a deliberate execution order. `scripts/phase-stabilization-build.mjs` is the single generator that combines them into `wa-calculator-runtime.js`; calculator HTML never loads those source modules directly.

Every generated module carries a short SHA-256 provenance marker. `qa/architecture-audit.mjs` verifies that every marker matches the current source, preventing a stale generated runtime from silently reaching production.

The source modules remain separately versioned because they represent distinct responsibilities (calculator definitions, rendering/runtime, site behavior, intelligence, SEO, and premium UX). This is intentional source modularity, not multiple page-loaded runtimes. `qa/code-quality-audit.mjs` additionally checks for exact duplicate source modules, duplicate function declarations within a module, stale canonical provenance, direct legacy calculator dependencies, and deploy-tree hygiene.

## Build and QA

1. Source changes are made in versioned modules.
2. `scripts/phase-stabilization-build.mjs` produces the deterministic calculator runtime and normalizes the 20 calculator pages.
3. `qa/calculator-regression.mjs` executes all 20 calculator definitions with defaults, golden checks, and monotonicity checks.
4. `qa/stabilization-audit.mjs` verifies runtime ownership and monetization contracts.
5. `qa/architecture-audit.mjs` verifies source/bundle provenance, source ownership, runtime uniqueness, bundle budget, and deploy-tree hygiene.
6. `qa/code-quality-audit.mjs` verifies source uniqueness, duplicate declarations, direct dependency isolation, and fresh bundle provenance.
7. `qa/phase45-production-audit.mjs` verifies calculator script uniqueness, SEO metadata, sitemap/robots, security headers, runtime size, and AdSense/ads.txt contracts.
8. Browser smoke workflows provide an additional UI-level regression layer against the exact production checkout.

## Production invariants

- 20 canonical calculators remain present.
- Calculator pages load exactly one `wa-calculator-runtime.js` entry point.
- The generated runtime must match all 13 current source-module hashes.
- Retired mutating workflows remain manual no-ops.
- AdSense publisher ID and `ads.txt` line are protected contracts.
- CSP and security headers remain present and compatible with required ad-quality endpoints.
- `node_modules/` is never deployable.
- A failed mandatory QA command must fail CI; it must never be converted into a warning.
- Release documentation must describe the current production scope and monetization state.

## Change discipline

**No test = no intentional production change.**

Do not manually patch generated calculator HTML when the change belongs to the canonical build. Do not modify AdSense/CMP/ads.txt as part of unrelated calculator, SEO, performance, or UX work. Keep release metadata synchronized whenever production architecture or monetization state changes.
