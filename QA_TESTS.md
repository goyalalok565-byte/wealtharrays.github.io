# Wealth Arrays Calculator QA Matrix

This repository-level QA matrix documents deterministic scenario tests for all 20 calculators.

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

- Empty/zero-style numeric inputs do not produce NaN or Infinity in normal UI paths.
- Negative numeric values are clamped or handled by calculator logic where appropriate.
- Freedom Milestone explicitly protects against a zero withdrawal rate.
- Debt Payoff identifies payments that do not exceed monthly interest rather than pretending the debt will be repaid.
- Mortgage, ROI and CAGR protect against invalid divide-by-zero or invalid annualization cases.

These tests verify calculator logic only. Final release QA should additionally check rendered UI on real Android/iPhone devices and current desktop browsers.
