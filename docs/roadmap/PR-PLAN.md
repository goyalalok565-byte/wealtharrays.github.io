# Delivery PR Plan

One purpose per PR, max 25 changed files, one push per PR batch. Keep PRs open until explicit owner approval. Do not publish security implementation details.

## Post-Phase-0 engineering fixes

| Item | Scope | Max files | Acceptance |
|---|---|---:|---|
| F1 | Calculation API bounded body handling + tests | 4 | Bounded read; oversized/malformed cases tested |
| F2 | Profit Margin/ROI undefined denominator contract + UI/tests | 6 | Clear unavailable state, never fabricated 0%; snapshots reviewed |
| F3 | Loan vs SIP semantics + independent vectors | 8 | Timing, cash-flow and amortization assumptions documented/tested |
| F4 | Service Worker verify-only audit, then isolated behavior fix | 5 | Cache versioning, update lifecycle, offline fallback and stale assets verified |
| F5 | Workflow path filters/concurrency | 6 | Required checks run for relevant changes; no skipped coverage |
| F6 | Exact Wrangler version + lockfile | 3 | Deterministic install; locally validated |

## Content quality: five PRs, eleven pages each
Each PR has 11 page files plus at most 3 shared support files (14 max). Every page gets original copy, worked example, five unique FAQs, common mistakes, limitations, official sources and updated metadata.

| PR | Pages |
|---|---|
| CONTENT-1 | Fixed Deposit, Recurring Deposit, Lumpsum, CAGR, Car Loan, Personal Loan, Debt Payoff, Inflation, Net Worth, Overtime Pay, Freelance Rate |
| CONTENT-2 | Income Tax Planner + 10 pages chosen by fresh full-catalog content audit |
| CONTENT-3 | Next 11 pages ranked by duplication, missing examples and weak sourcing |
| CONTENT-4 | Next 11 pages by same audit |
| CONTENT-5 | Remaining pages/gaps from full 55-page audit (up to 11) |

Never invent page names. Search Console demand is unverified until queried. Tax/legal claims require official-source reconciliation before rates or rules are added.

## Locale programme

| PR | Scope | Max files |
|---|---|---:|
| LOCALE-1 | Locale-aware numbers, editable currency, language preference model | 10 |
| LOCALE-2 | Currency metadata/display tests; no FX claims | 12 |
| LOCALE-3 | India pack with official source/effective date | 15 |
| LOCALE-4 | US pack with official source/effective date | 15 |
| LOCALE-5 | UK pack with official source/effective date | 15 |
| LOCALE-6 | UAE pack with official source/effective date | 15 |
| LOCALE-7 | Canada pack with official source/effective date | 15 |
| LOCALE-8 | Australia pack with official source/effective date | 15 |
| LOCALE-9 | Singapore pack with official source/effective date | 15 |
| LOCALE-10 | EU country-specific packs, split where needed | 15 |

Country order: India, US, UK, UAE, Canada, Australia, Singapore, EU. Every preset requires official URL, jurisdiction, effective date, rule/model version, reviewer, test vectors and review/expiry trigger. No location tracking or silent tax-jurisdiction selection.

## Dependency order
1. Phase 0 complete, production verified, owner-approved merge.
2. F1–F6 isolated PRs.
3. Independent references and content quality.
4. Verify backend live before SaaS feature code.
5. Batch 1; shared cash-flow engine before NPV.
6. Batch 2 after cash-flow, TVM and loan-engine prerequisites.
7. Locale foundation before country packs.

## PR hygiene
Use exact main base; refresh only via explicit reviewed plan. Public PR descriptions remain product/formula/QA focused. Never lower performance, accessibility, SEO or reliability thresholds. No provider onboarding, live payment changes, settings or credentials in these PRs.
