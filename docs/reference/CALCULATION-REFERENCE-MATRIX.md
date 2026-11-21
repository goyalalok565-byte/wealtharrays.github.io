# Calculation Reference Matrix

Evidence reviewed at main `dc8ec0237133c37f3aa4098e7f2e9067f4746b80`. “Independent reference exists in tests” means a separate vector appears in `tests/independent-calculator-references.test.js`; it is not full edge-case certification. X=independent equation/loop; S=spreadsheet; E=official evidence; FX=exchange-rate source; P=policy/jurisdiction source.

| Calculator ID | Formula family | Ref type | Source needed | Status |
|---|---|---|---|---|
| sip | Annuity-due FV | X/S | Excel FV; contribution timing | independent reference exists in tests |
| compound-interest | Compound growth | X/S | Excel FV | independent reference exists in tests |
| mortgage | Amortizing loan | X/S | Excel PMT | independent reference exists in tests |
| roi | Total/annualized return | X/S | Excel return equations | pending |
| simple-interest | Linear interest | X/S | Excel arithmetic | pending |
| freedom-milestone | Goal/withdrawal projection | X/S | Assumption provenance | pending |
| salary-hourly | Unit conversion | X/S | Dimensional arithmetic | pending |
| profit-margin | Margin ratios | X/S | Accounting definitions | pending |
| fixed-deposit | Compound deposit | X/S/E | Excel FV; product terms | pending |
| recurring-deposit | Monthly annuity FV | X/S | Excel FV; payment timing | pending |
| lumpsum | Compound growth | X/S | Excel FV | independent reference exists in tests |
| cagr | Geometric annualized growth | X/S | Excel RATE/CAGR | pending |
| car-loan | Loan + down payment | X/S | Excel PMT | pending |
| personal-loan | Amortizing loan | X/S | Excel PMT | pending |
| debt-payoff | Balance recurrence | X/S | Independent monthly schedule | pending |
| inflation | Compound price-level projection | X/S/E | Official CPI context | pending |
| net-worth | Assets minus liabilities | X/S | Arithmetic | pending |
| overtime | Hourly × hours × multiplier | X/S/P | Applicable employment policy | pending |
| freelance-rate | Cost recovery / billable utilization | X/S | Arithmetic | pending |
| income-tax-planner | User-entered effective-rate estimate | X/S/P | Official source for any preset | independent reference exists in tests |
| ppf-growth | Contribution + compounding | X/S/E/P | Official scheme rules/rate | pending |
| epf-growth | Payroll contribution + compounding | X/S/E/P | EPFO rules/rates | pending |
| gst | Exclusive tax calculation | X/S/E/P | Official authority for presets | independent reference exists in tests |
| emergency-fund | Expense multiple / savings gap | X/S | Arithmetic | pending |
| credit-card-payoff | Revolving balance recurrence | X/S/P | Issuer terms for presets | pending |
| step-up-sip | Escalating annuity recurrence | X/S | Independent monthly loop | pending |
| sip-goal | Inverse annuity-due solve | X/S | Excel FV/PMT | pending |
| gratuity | Salary × service benefit | X/S/E/P | Official labour/tax source | pending |
| hra-exemption | Rule-based benefit cap | X/S/E/P | Official statute/date | pending |
| nps | Contribution/growth/annuity split | X/S/E/P | Official scheme sources | pending |
| swp | Withdrawal recurrence | X/S | Independent monthly loop | independent reference exists in tests |
| ssy | Annual deposits and maturity | X/S/E/P | Official rate/rules/date | independent reference exists in tests |
| rule-of-72 | Approximation | X/S | Approximation limits | pending |
| rent-vs-buy | Loan + rent + opportunity cost | X/S | Independent scenario model | independent reference exists in tests |
| fire | Inflation-adjusted target/accumulation | X/S | Assumption disclosure | independent reference exists in tests |
| budget-50-30-20 | Percentage allocation | X/S | Arithmetic | pending |
| break-even | Fixed/variable cost | X/S | Accounting definitions | pending |
| cost-of-delay | Opportunity cost over time | X/S | Time-value equation | pending |
| advanced-home-loan-eligibility | Affordability ratio | X/S/P | Lender policy for presets | pending |
| currency-converter | FX multiplication | X/FX | Dated rate provider | pending |
| flat-cost | Purchase-cost aggregation | X/S/P | Official fee sources | pending |
| loan-emi | Amortizing payment | X/S | Excel PMT | pending |
| capital-gain | Cost basis and gain | X/S/P | Official tax authority | pending |
| lumpsum-sip | Lump sum + annuity-due FV | X/S | Excel FV | pending |
| loan-against-property | LTV + amortization | X/S/P | Lender terms | pending |
| ltv | Loan-to-value ratio | X/S | Arithmetic | pending |
| home-loan-eligibility | FOIR/affordability | X/S/P | Lender policy | pending |
| silver-jewelry | Weight × purity × price + charges | X/S/FX | Dated metal price | pending |
| gold-jewelry | Weight × purity × price + charges | X/S/FX | Dated metal price | pending |
| consumer-durable-loan | Loan + fee | X/S | Excel PMT; fee contract | pending |
| loan-prepayment-vs-sip | Paired debt/investment scenarios | X/S | Independent paired model | pending |
| stamp-duty | Percentage fee aggregation | X/S/E/P | Official authority/date | pending |
| property-calculator | Purchase finance/cost | X/S/P | Official fee sources | pending |
| loan-interest | Amortization interest total | X/S | Excel PMT/schedule | pending |

## Inventory note
The definition directory listing returned 56 JavaScript files while the golden-snapshot test asserts 55 canonical calculators. This matrix records 55 unique IDs from the catalogue-level inventory; confirm canonical membership and any legacy file before certification. The existing independent suite contains vectors for sip, swp, fire, mortgage, lumpsum, compound-interest, rent-vs-buy, ssy, income-tax-planner and gst.
