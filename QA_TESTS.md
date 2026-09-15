# Wealth Arrays Calculator QA Matrix

This repository-level QA matrix documents deterministic scenario tests for all 20 calculators and the current production runtime. The previously removed Smart Calculator Assistant is intentionally not part of the release contract.

| Calculator | Scenario | Expected check |
|---|---|---|
| SIP | ₹/$1,000 monthly, 0%, 2 years | Total invested = 24,000 |
| Compound Interest | 1,000 principal, 12%, monthly, 1 year | Final ≈ 1,126.825 |
| Mortgage / EMI | 12,000 principal, 0%, 1 year | Payment = 1,000/month |
| ROI | 1,000 → 1,210 over 2 years | ROI = 21%, annualized ≈ 10% |
| Simple Interest | 1,000 at 10% for 2 years | Interest = 200 |
| Freedom Milestone | 40,000 expenses, 4% withdrawal | Target = 1,000,000 |
| Salary ↔ Hourly | 52,000 / (40 × 52) | Hourly = 25 |
| Profit Margin | Revenue 1,000, COGS 400, expenses 100 | Net margin = 50% |
| Fixed Deposit | 1,000 at 10% for 1 year | Maturity = 1,100 |
| Recurring Deposit | 100/month, 0%, 1 year | Total = 1,200 |
| Lumpsum | 1,000 at 10% for 2 years | Final = 1,210 |
| CAGR | 1,000 → 1,210 over 2 years | CAGR ≈ 10% |
| Car Loan | 12,000 price, 2,000 down, 0%, 1 year | Payment ≈ 833.33 |
| Personal Loan | 12,000, 0%, 1 year | Payment = 1,000/month |
| Debt Payoff | 1,200 balance, 0%, 100/month | 12 months |
| Inflation | 1,000 at 10% for 2 years | Future equivalent = 1,210 |
| Net Worth | Assets 8,000, debt 1,500 | Net worth = 6,500 |
| Overtime Pay | 20/hour, 40 regular, 10 OT at 1.5× | Total = 1,100 |
| Freelance Rate | 50,000 income + 10,000 costs / 1,000 hours | Rate = 60/hour |
| Income Tax Scenario | 100,000 income, 20,000 deductions, 20% | Tax = 16,000 |

## Edge-case checks

- Empty required numeric inputs keep the calculator in a clear incomplete state instead of calculating from hidden defaults.
- Zero-rate cases are explicitly handled where the underlying formula has a divide-by-zero branch.
- Negative numeric values are constrained by field minimums or handled by calculator logic where appropriate.
- Freedom Milestone protects against a zero withdrawal rate.
- Debt Payoff identifies payments that do not exceed monthly interest rather than pretending the debt will be repaid.
- Mortgage, ROI and CAGR protect against invalid divide-by-zero or invalid annualization cases.
- Results that become non-finite are rejected by the UI rather than rendered as NaN/Infinity.

## Phase 1 independent audit — 2026-09-15

`qa/phase1-calculator-audit.mjs` independently re-implements the expected mathematics for all 20 calculator IDs and compares the live `calculators.js` results against those references. CI runs the audit on every push to `main` and can also be run manually.

The audit covers:

- all 20 calculator definitions are present;
- default/reference scenarios;
- stress scenarios kept inside a finite numerical domain;
- zero-rate branches for growth and loan calculators;
- zero/negative-growth cases where the model permits them;
- alternate salary conversion direction;
- debt-payoff behavior when the payment is insufficient;
- non-finite output rejection (`NaN`, `Infinity`, `-Infinity`);
- exact label/result-pair matching against independent reference equations.

## Calculator review standard

Each calculator page now exposes a Phase 1 review panel with a **Last reviewed** date, publisher identity, calculation basis, important assumptions and a review/source note. The review panel intentionally does not claim professional certification or regulated financial advice. Country-specific calculators must identify their jurisdiction and tax year; the current Income Tax Planner does not use tax tables and is explicitly jurisdiction-neutral.

The review date is currently **2026-09-15**. A material formula, assumption or regulatory change should trigger a new review date and an updated QA scenario before release.

## Current production QA

1. **Deterministic calculators:** identical inputs produce identical outputs; formulas are local and transparent.
2. **Input integrity:** required fields remain incomplete until supplied; min/max constraints and validation prevent unsupported numeric states.
3. **Plain-language results:** the interface explains the main result and its assumptions without presenting the output as financial advice.
4. **Scenario guidance:** calculators that support projections expose comparison or sensitivity information where meaningful.
5. **Cross-calculator navigation:** related-tool links connect investment, inflation, debt, retirement, income and business workflows.
6. **Voice UX:** supported browsers can accept a spoken number for the selected input field and can read a resulting value aloud where the browser permits it. Microphone permission and browser support remain required.
7. **Mobile UX:** calculator controls use large touch targets, responsive layouts and compact result/chart presentation on narrow screens.
8. **Privacy:** calculator inputs are designed to remain browser-first; analytics is consent-aware and should not receive raw financial inputs.
9. **PWA:** manifest, install prompt handling, service-worker registration and cache/version contracts are validated by GitHub Actions.
10. **Page integrity:** indexable pages must have one footer, the expected OG image, and no duplicate managed runtime scripts. Intentional noindex redirect shells are excluded from the full page-shell contract.
11. **SEO integrity:** robots points to the sitemap; sitemap contains canonical indexable URLs and excludes known redirect-only pages.
12. **Tax positioning:** the Income Tax Scenario Calculator is explicitly a jurisdiction-neutral effective-rate model, not official tax filing software.

## Release note

The matrix documents deterministic expected outcomes and release criteria. It is not a substitute for physical-device testing. Before a public advertising launch, verify the 20 scenarios in the live build plus Chrome Android, Safari iPhone, and a current desktop browser, including microphone permission, dark/light mode, currency switching, charts, comparison, share/export, and analytics events.
