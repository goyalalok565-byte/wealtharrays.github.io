# Wealth Arrays Calculator QA Matrix

This repository-level QA matrix documents deterministic scenario tests for all 20 calculators and the Phase 9 Smart Calculator layer.

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
| Income Tax Planner | 100,000 income, 20,000 deductions, 20% | Tax = 16,000 |

## Edge-case checks

- Empty required numeric inputs keep the calculator in a clear incomplete state instead of calculating from hidden defaults.
- Zero-rate cases are explicitly handled where the underlying formula has a divide-by-zero branch.
- Negative numeric values are constrained by field minimums or handled by calculator logic where appropriate.
- Freedom Milestone protects against a zero withdrawal rate.
- Debt Payoff identifies payments that do not exceed monthly interest rather than pretending the debt will be repaid.
- Mortgage, ROI and CAGR protect against invalid divide-by-zero or invalid annualization cases.
- Results that become non-finite are rejected by the UI rather than rendered as NaN/Infinity.

## Phase 9 Smart Calculator QA

1. **Input intelligence:** required fields stay empty until the user supplies values; min/max constraints and smart warnings flag unsupported or suspicious assumptions.
2. **Plain-language results:** Smart Assist explains the main result in user-facing language rather than exposing formula jargon as the primary explanation.
3. **Scenario suggestions:** calculators with projection data expose comparison/conservative scenario actions and sensitivity information where meaningful.
4. **Goal guidance:** Smart Assist provides next-step guidance and routes users to related calculators rather than presenting a single number as a financial recommendation.
5. **Cross-calculator intelligence:** contextual related-tool links connect investment, inflation, debt, retirement, income and business workflows.
6. **Voice UX:** supported browsers can accept a spoken number for the selected input field and trigger recalculation; the browser can also read the resulting value aloud. Microphone permission and browser support remain required.
7. **Mobile UX:** calculator controls use large touch targets, single-column input layout on narrow screens, responsive scenario comparison, and compact chart/result spacing.
8. **Production audit:** no feature should be described as guaranteed financial advice or guaranteed investment performance. Real-device/browser QA remains necessary because GitHub source inspection cannot reproduce every Android/iPhone browser, microphone permission state, CDN cache state, or viewport.

## Release note

The matrix documents deterministic expected outcomes and release criteria. It is not a substitute for running the site on physical devices. Before a public release, verify the 20 scenarios in the live build plus Chrome Android, Safari iPhone, and a current desktop browser, including microphone permission, dark/light mode, currency switching, charts, comparison, share/export, and analytics events.
