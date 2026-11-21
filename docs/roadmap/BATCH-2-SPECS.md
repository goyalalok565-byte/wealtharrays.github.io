# Batch 2 Calculator Specifications

Status: specification only; no calculator implementation or legal/tax preset is authorized by this document.

## Shared acceptance contract

Every calculator must use locale-aware input/output formatting with an editable currency selector, no location tracking, no forced country default, and globally understandable terminology. Rates, fees, compounding frequency, payment timing and date conventions must be explicit inputs where material. Never hardcode market returns, lender terms, tax rates, statutory limits, FX rates or jurisdiction-specific legal assumptions. Preserve full precision internally and round only displayed values. Blank, invalid, zero-denominator and non-solvable states must be explicit; undefined must never be represented as zero. Provide default, zero, blank, boundary, large and invalid regression vectors, plus an independent Excel workbook/script reference. Excel is a verification aid, not the production calculation engine.

---

## 1. IRR / XIRR

### Inputs
- Cash-flow rows: date and signed amount; at least one negative and one positive flow.
- Valuation date (defaults to earliest flow date), calculation mode (periodic IRR or dated XIRR), periodic frequency for IRR, and explicit day-count convention for XIRR (initial supported convention: Actual/365 Fixed).
- Optional display precision; never used by the solver.

### Outputs
Periodic/annualized rate as appropriate, NPV residual, convergence status, iteration count, bracket, and a multiple-root warning when cash-flow signs change more than once. XIRR must label its day-count convention.

### Formula
IRR solves:
\[
0=\sum_{t=0}^{n}\frac{C_t}{(1+r)^t}
\]
XIRR under Actual/365 Fixed solves:
\[
0=\sum_i\frac{C_i}{(1+r)^{(d_i-d_0)/365}}
\]
Use a bracketed bisection solver with documented tolerance and iteration cap; Newton can only accelerate inside a valid bracket and must fall back to bisection.

### Edge cases
No sign change, all-zero flows, fewer than two non-zero flows, same-date flows that net to zero, invalid dates, duplicate dates, multiple sign changes/multiple roots, rate near −100%, extreme magnitudes and no root in the supported domain. Aggregate same-date flows before solving.

### Do not hardcode
Return assumptions, dates, day-count, periodic frequency, fees, tax, risk-free rates or a unique-root guarantee.

### Independent Excel reference
Use IRR(values, guess) for equally spaced periods and XIRR(values, dates, guess) for dated flows. Cross-check with NPV/XNPV at the reported rate and record Excel version and convention.

### Worked examples
1. Periodic: flows −1,000 at period 0, +600 at period 1 and +600 at period 2. Equation: −1,000 + 600/(1+r) + 600/(1+r)^2 = 0. Result: IRR approximately **13.0662% per period**.
2. Dated: −1,000 on 2025-01-01, +500 on 2025-07-02 and +600 on 2026-01-01. XIRR uses actual elapsed days/365; the reference workbook must calculate and record the rate and solver residual before publication. Do not substitute a guessed annual rate.

### Global-first
Label cash-flow signs, periodic vs dated method, day-count, and annualization. Show dates in the user's locale but preserve ISO dates in exports. Do not call an IRR a guaranteed return.

---

## 2. Time Value of Money (TVM)

### Inputs
Any four of present value (PV), future value (FV), periodic rate, number of periods (N), payment (PMT), payment timing (beginning/end), compounding frequency and payment frequency. Require a clear solve-for selection and explicit sign convention.

### Outputs
Solved variable, complete cash-flow direction, total contributions/payments and interest earned/paid where derivable, plus assumptions.

### Formula
For end-of-period payments:
\[
FV=PV(1+i)^N+PMT\frac{(1+i)^N-1}{i}
\]
For beginning-of-period payments multiply the payment factor by (1+i). At i=0, the annuity factor is N. For non-matching compounding/payment frequencies, convert the quoted nominal annual rate to an effective payment-period rate explicitly.

### Edge cases
Zero rate, zero periods, negative rate greater than −100% per period, payment at beginning/end, inconsistent signs, missing solve-for variable, non-integer periods when unsupported, and incompatible frequencies.

### Do not hardcode
Interest rates, compounding frequency, payment timing, currency, inflation or a default investment return.

### Independent Excel reference
Use PV, FV, RATE, NPER, and PMT; explicitly match Excel's type argument (0 end, 1 beginning) and sign convention.

### Worked examples
1. PV 1,000, periodic rate 1%, 12 periods, no payments: FV = 1,000 × 1.01^12 = **1,126.8250**.
2. PV 0, payment 100 at each month-end, monthly rate 1%, 12 payments: FV = 100 × ((1.01^12 − 1)/0.01) = **1,268.2503**.

### Global-first
Separate nominal annual rate from effective rate. Display compounding and payment frequency in plain language; never infer a user's tax, inflation or expected return.

---

## 3. Amortization / Refinance / Payoff

### Inputs
Original/current principal, annual nominal rate, remaining term, payment frequency, payment timing, start/next due date, optional extra payment schedule, fees, refinance rate/term/closing costs, and comparison horizon. Permit a user-entered payoff date and payoff quote adjustments.

### Outputs
Regular payment, dated schedule (opening balance, interest, principal, extra payment, closing balance), total interest, payoff date, remaining balance at horizon, refinance payment/costs, break-even month and net savings at the selected horizon.

### Formula
For a fixed-rate, equal-period, end-period loan:
\[
PMT=P\frac{i}{1-(1+i)^{-N}}
\]
Each period: interest = opening balance × periodic rate; principal = payment − interest; closing balance = opening − principal − extra principal. Refinance comparisons must compare equivalent remaining horizons and include user-entered costs. Break-even is the first period cumulative payment/interest savings exceed refinance costs, with a clearly defined comparison basis.

### Edge cases
Zero rate, payment below accrued interest (negative amortization), extra payment exceeding balance, final partial payment, rate changes, irregular dates, fees financed vs paid upfront, payoff quote adjustments, term shorter/longer, and no break-even within horizon.

### Do not hardcode
Lender fees, prepayment penalties, escrow, insurance, legal charges, market rates, tax treatment, or lender-specific daily-interest conventions.

### Independent Excel reference
Build a period-by-period schedule using IPMT/PPMT or transparent formulas; verify payment with PMT. For irregular dates, use a separate date-aware reference model rather than forcing a monthly Excel schedule.

### Worked examples
1. Principal 100,000, annual nominal rate 6%, monthly payments, 12 months: monthly payment = 100,000 × 0.005/(1−1.005^-12) = **8,606.64** (approximately).
2. Principal 250,000, annual nominal rate 5%, monthly payments, 240 months: monthly payment = 250,000 × (0.05/12)/(1−(1+0.05/12)^-240) = **1,649.89** (approximately). Fees and optional prepayments are excluded.

### Global-first
Use generic loan repayment schedule; mortgage/home-loan and other loan labels may be aliases. Currency, due dates, compounding, day-count and fee treatment must be editable and visible. Do not assume US escrow or any country's prepayment law.

---

## 4. Credit Card Minimum Payment

### Inputs
Statement balance, new purchases, credits/refunds, annual purchase APR, cash-advance APR and balance-transfer APR (optional), minimum-payment rule selected by user (percentage, fixed floor, interest+percentage, or custom issuer rule), fixed minimum floor, percentage, fees, payment date, grace-period status and optional extra monthly payment.

### Outputs
Calculated minimum due under the selected rule, interest estimate, projected payoff months, total interest, and schedule showing balance, interest, payment and remaining balance. Clearly distinguish estimate from an issuer statement.

### Formula
The rule is selected by the user and must be shown. For a simple percentage-plus-floor rule:
\[
Minimum=\max(Floor,\; Balance\times Percentage)
\]
subject to balance due and any user-entered issuer-specific rule. Monthly projection may use a periodic rate only when the user selects that approximation; daily-balance method requires daily transaction/payment dates and a specified day-count.

### Edge cases
Zero balance, minimum above balance, interest-only or insufficient payment, promotional 0% periods, multiple APR buckets, grace-period loss, late/annual fees, new purchases, cash advances, negative credits, and minimum payment below monthly interest.

### Do not hardcode
Issuer rules, percentage/floor, APR, penalty APR, grace-period treatment, fees, daily-balance method or regulatory requirements.

### Independent Excel reference
Use a row-by-row spreadsheet with explicit balance buckets and date-level interest; cross-check the selected minimum formula and amortization. Do not cite a generic PMT formula as a universal issuer minimum-payment rule.

### Worked examples
1. Balance 2,000, user-selected 2% minimum with 25 floor: max(25, 2,000×2%) = **40.00**.
2. Balance 800, user-selected 2% minimum with 25 floor: max(25, 800×2%) = **25.00**.

### Global-first
Use generic credit-card terminology, allow local currency and editable issuer terms, and label all projections as estimates. No country-specific legal minimum is presented without a dated official country pack and review.

---

## 5. Loan Comparison

### Inputs
Two or more loan offers: principal/net proceeds, nominal rate, fixed/variable flag, term, payment frequency/timing, compounding, upfront/ongoing fees, financed fees, balloon/residual, introductory period, rate-reset assumptions, and comparison horizon. Users can compare up to the product's supported offer count.

### Outputs
Payment by period, total payments, total interest, upfront cash required, total known fees, balance at comparison horizon, borrower cash-flow APR estimate where supported, and side-by-side differences. Unknown variable-rate future costs must be marked unknown/scenario-based.

### Formula
Use the amortizing payment formula for fixed equal-period loans. Add financed fees to principal only when the offer explicitly finances them. Compare cash flows on a consistent borrower basis and identical horizon; do not rank offers by monthly payment alone. Calculate an APR estimate from net proceeds and dated required payments only where fee/timing data is complete and convention is explicit.

### Edge cases
Different terms, payment frequencies, introductory rates, variable resets, balloon payments, fees paid upfront vs financed, missing fee data, early payoff, negative amortization, and incomparable currencies.

### Do not hardcode
Rates, lender fees, tax deductions, prepayment rules, FX rates, variable-rate paths or lender eligibility assumptions.

### Independent Excel reference
Use separate PMT/IPMT/PPMT schedules for fixed-rate offers and a dated cash-flow/XIRR model for fee-adjusted comparisons. Record assumptions per offer.

### Worked examples
1. Offer A: 100,000 at 6% nominal annual, monthly, 24 months; payment approximately **4,432.06**. Offer B: same principal at 7%, monthly, 24 months; payment approximately **4,477.27**. Base payments exclude fees.
2. Offer A: 100,000 at 6% over 24 months with 500 paid upfront; Offer B: 100,000 at 6% over 24 months with 500 added to financed principal. Show base rate/payment separately from net proceeds/total cost; calculate fee-adjusted APR from exact cash flows rather than declaring them equivalent.

### Global-first
Allow different local naming (personal loan, mortgage/home loan, auto loan) without embedding local rules. Compare only same-currency offers unless the user supplies an FX rate and date. Clearly identify estimates and unknown variable-rate costs.

---

## 6. Savings / APY / CD

### Inputs
Initial deposit, recurring deposits and timing, nominal annual rate or effective APY (choose one input basis), compounding frequency, term, deposit frequency, withdrawal schedule, fees/penalties, and optional inflation assumption entered by the user.

### Outputs
Ending balance, total deposits, interest earned, effective annual yield, average/periodic rate, and net balance after user-entered fees/withdrawals. Label CD/term-deposit maturity and early-withdrawal estimate separately.

### Formula
For a single deposit with nominal annual rate j compounded m times yearly:
\[
FV=P(1+j/m)^{mt}
\]
Effective annual yield:
\[
APY=(1+j/m)^m-1
\]
For recurring deposits, compound each deposit from its actual contribution date; do not use a single-deposit formula unless timing is equivalent. If the input is already APY, do not apply compounding conversion again.

### Edge cases
Zero rate, zero term, deposit at beginning/end, irregular deposits, early withdrawals, fees, penalty exceeding interest, rate tiers, variable rates, and APY vs nominal-rate confusion.

### Do not hardcode
Bank rates, deposit insurance, tax on interest, early-withdrawal penalties, minimum balance, contribution limits, or country-specific product law.

### Independent Excel reference
Use FV for regular equal-period deposits and a dated row-by-row compounding model for irregular contributions/withdrawals. Verify APY with the effective-rate formula.

### Worked examples
1. Deposit 10,000 at 5% nominal annual compounded monthly for 2 years: FV = 10,000 × (1+0.05/12)^24 = **11,048.95** (approximately).
2. Deposit 10,000 at 5% nominal annual compounded quarterly for 2 years: FV = 10,000 × (1+0.05/4)^8 = **11,044.86** (approximately).

### Global-first
Use savings account / term deposit (CD) terminology, make deposit/compounding frequency editable, and do not assume US CD rules or India fixed-deposit rules. Tax, deposit protection and penalty details require jurisdiction-specific, dated official sources and must remain user-visible assumptions.
