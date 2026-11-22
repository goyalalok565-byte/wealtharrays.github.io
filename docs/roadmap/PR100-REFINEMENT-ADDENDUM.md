# PR #100 Refinement Addendum

This addendum closes the specification gaps identified during review without rewriting the original planning documents.

## APR: complete fee-and-timing example

Assume a lender disburses a stated principal of 10,000 at time zero and deducts a 200 origination fee immediately. The borrower therefore receives net proceeds of 9,800. The borrower makes 12 equal payments of 888.49, each at the end of months 1 through 12. There are no other charges, balloon payments, or optional products.

Borrower-perspective periodic cash flows are:

| Period | Cash flow |
|---|---:|
| 0 (disbursement date) | +9,800.00 |
| 1–12 (each month-end) | −888.49 |

The periodic rate solves:

\[
0=9{,}800-\sum_{k=1}^{12}\frac{888.49}{(1+r)^k}
\]

A bracketed bisection solver gives a monthly rate of approximately 1.3212482%. The nominal annualized APR is 12 × r = **15.85498% (approximately 15.85%)**. The effective annual rate, shown separately and not mislabeled as nominal APR, is (1+r)^12 − 1 = **17.05942% (approximately 17.06%)**.

The 200 fee is reflected by reducing the time-zero proceeds from 10,000 to 9,800; it is not added again to the monthly payments. If a fee is paid separately at a known date, represent it as a separate negative borrower cash flow on that date. If the payment schedule is irregular, use actual dates and the selected day-count convention rather than assuming equal monthly periods. The tool must label the APR convention and must not silently treat an effective annual rate as nominal APR.

## Shared cash-flow engine: normative behavior

### Input and sign convention
- Accept an ordered list of dated cash flows and a valuation/start date.
- Use investor/borrower perspective consistently: money received is positive; money paid is negative. A standard investment therefore usually starts negative and has later positive receipts. A borrowing APR example has positive net proceeds at time zero and negative repayments.
- Validate finite amounts and valid dates. Normalize dates to calendar days before grouping.
- Aggregate all flows on the same date by summing them before solving. A net-zero date is removed. Preserve the original input in diagnostics if a caller requests an audit trail.

### Day-count and periodic modes
- Support two explicit modes, never an implicit mixture:
  1. `periodic`: equal-period discounting, with caller-supplied periods-per-year (e.g. 12 for monthly). Period index 0 is the valuation date.
  2. `actual-365`: year fraction is actual elapsed calendar days divided by 365. Leap days count as actual elapsed days; the denominator remains 365. Do not silently switch to Actual/Actual or 30/360.
- The caller must select the mode. APR pages that follow a jurisdiction-specific statutory method must specify that method separately and must not claim this generic engine alone establishes legal APR compliance.

### Solver
- Solve NPV(rate) = Σ amountᵢ / (1 + rate)^(yearFractionᵢ) = 0, with rate greater than −1.
- Prefer a bracketed bisection solver for deterministic convergence. Start with a documented domain such as `[-0.999999, 1]`; expand the upper bound geometrically up to a finite safety cap until a sign-changing bracket is found. Never cross or include rate = −1.
- Stop when either `abs(NPV) <= max(1e-10, 1e-10 × sum(abs(amounts)))` or bracket width is at most `1e-12`; hard cap 200 iterations. Return the achieved residual, bracket, iterations and convergence flag.
- Newton may be used only as an optional acceleration from a valid bracket, with derivative/finite checks and automatic bisection fallback. It must never be the only convergence path.

### Edge cases and acceptance rules
- Fewer than two non-zero dated flows: `not-solvable`.
- No positive and negative flows after same-date aggregation: `not-solvable`.
- No sign-changing NPV bracket in the supported domain: `no-root-in-domain`.
- Multiple sign changes can produce multiple IRRs. Report `multiple-root-risk` when cash-flow signs change more than once in chronological order; do not silently promise a unique IRR.
- Reject invalid dates, non-finite amounts, invalid periods-per-year, and rates outside the supported domain with typed validation errors.
- Test exact zero rate, near-zero rate, same-date offsets, irregular dates, leap-day spans, large magnitudes, non-convergent cases, multiple sign changes, and rate-near-minus-one behavior.
- Never coerce an undefined result to zero and never round intermediate solver values. Round only presentation outputs.

## Separate engine PR scopes and budgets

| PR | Purpose | Allowed files (maximum 25) | Explicit exclusions |
|---|---|---:|---|
| Shared Cash-Flow Engine | Pure date/period cash-flow normalization, NPV, IRR/XIRR solver, typed diagnostics, independent unit tests and reference vectors | 12: 1 engine module, 1 public contract/types file, 1 solver test file, 1 normalization test file, 1 reference-vector fixture, up to 7 focused docs/examples | No calculator UI, registry, route, snapshots, tax/legal presets, API wiring, or loan amortization |
| Shared Loan Engine | Pure amortization schedule, payment calculation, payoff/prepayment and refinance primitives, independent tests and reference vectors | 14: 1 engine module, 1 contract/types file, 1 schedule test, 1 payment test, 1 prepayment test, 1 reference fixture, up to 8 focused docs/examples | No cash-flow IRR solver duplication, calculator UI, registry, route, snapshots, jurisdictional legal rules, or API wiring |

Each engine PR must remain independently reviewable, add new files only, include default/zero/blank/large/invalid test vectors, and document its independent reference method. The cash-flow and loan engines are separate PRs and must not be combined.
