# Calculator Gap Program

Score = `0.45 × Demand + 0.35 × Gap + 0.20 × Fit`. **Demand estimates: UNVERIFIED** until Search Console and customer evidence are reviewed. Scores are prioritization hypotheses, not measured demand.

| Rank | Calculator | Score |
|---:|---|---:|
| 1 | IRR/XIRR | 5.00 |
| 2 | Sales Tax/VAT/GST | 4.80 |
| 3 | Credit Card Minimum Payment | 4.80 |
| 4 | Time Value of Money (TVM) | 4.65 |
| 5 | Amortization/Refinance/Payoff | 4.65 |
| 6 | NPV | 4.55 |
| 7 | APR | 4.35 |
| 8 | Loan Comparison | 4.20 |
| 9 | Discount | 4.00 |
| 10 | Margin/Markup | 4.00 |
| 11 | Savings/APY/CD | 4.00 |
| 12 | Business Loan | 3.80 |
| 13 | Refinance Break-even | 3.80 |
| 14 | Rental Yield/Cap Rate | 3.65 |
| 15 | Commission | 3.55 |
| 16 | Life Insurance Need | 3.55 |
| 17 | Depreciation | 3.55 |
| 18 | Payback | 3.20 |
| 19 | HELOC | 3.15 |
| 20 | Lease vs Buy | 3.00 |

## Batches
**Batch 1:** Discount; Sales Tax/VAT/GST; NPV; APR; Margin/Markup; Commission.

**Batch 2:** IRR/XIRR; TVM; Amortization/Refinance/Payoff; Credit Card Minimum Payment; Loan Comparison; Savings/APY/CD.

Cash-flow engine precedes NPV and IRR/XIRR. Loan engine supports amortization/refinance/payoff/comparison. TVM supports savings and comparison. Credit-card minimum-payment rules must be user-selected or backed by a verified issuer/jurisdiction source; never invent issuer rules.

## Existing overlap
- Profit Margin already calculates gross/net margin; markup is absent. Add separately labelled markup, never conflate margin and markup.
- Mortgage and Personal Loan already calculate scheduled payments and repayment totals with amortization-related capability. Do not create a duplicate generic repayment engine.
- Credit Card Payoff uses a fixed payment. Minimum-payment mode is a genuine gap because payment changes under a defined minimum-payment rule.
- GST exists. A separate global Sales Tax/VAT/GST estimator is justified for inclusive/exclusive pricing and configurable labels, but must not imply tax rates or filing rules are universal.

## Global-first rules
- Currency-agnostic arithmetic; currency is display metadata.
- Locale-aware formatting and editable currency selection. Browser locale may suggest formatting but must not silently select tax jurisdiction.
- No location tracking, country default or automatic legal/tax inference.
- Generic terminology; rates, tax-inclusive/exclusive mode and rounding policy are user-entered.
- Country preset requires official source, jurisdiction, effective date, model version, tests and review owner. Never label unverified/expired presets current.
- Explain assumptions and exclusions. Separate mathematical estimates from legal, tax, lender and investment advice.
- AI may explain deterministic results but must not invent or alter numbers.

## Acceptance
Each tool needs an approved formula spec; independent reference or spreadsheet; default/zero/blank/large/invalid fixtures where applicable; reviewed snapshots; explicit tolerance and rounding; two worked examples; five unique FAQs; common mistakes, limitations and sources; accessible responsive UI; registry/sitemap/AI-index parity; and no unsourced currency, tax, issuer or jurisdiction assumptions.
