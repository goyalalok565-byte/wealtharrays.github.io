# Batch 1 Calculator Specifications

Proposed formula/product contract only; no live calculator is changed.

## Shared conventions
Money values are currency-agnostic. Currency/locale affect display only. Percentages are percentage points (8.5 means 8.5%). Validate finite values and domain constraints; preserve negative profit where valid. Never hardcode currency, tax rate, country rule, retailer/employer policy or investment recommendation.

## 1. Discount
**Inputs:** original unit price ≥0; mode (rate or amount); rate 0–100% or fixed discount 0–price; positive integer quantity (default 1).
**Outputs:** discount/unit, net/unit, total savings, total net price.
**Formula:** rate mode (D=P×d/100); amount mode (D=d); (N=P-D); savings (qD); total (qN).
**Edges:** zero price valid; reject negative price/quantity, invalid rate and discount above price. Blank required values are validation errors. Keep precision internally; define display rounding.
**Never hardcode:** currency, promotion eligibility, shipping, tax, merchant rules or discount.
**Excel:** `=A2*B2/100` discount; `=A2-C2` net; `=C2*D2` savings; `=B2*D2` total net (A=price, B=rate, C=discount, D=qty).
**Examples:** 200 at 15%, qty 2 → discount 30/unit, net 170, savings 60, total 340. 1,250 less 125, qty 3 → net 1,125/unit, savings 375, total 3,375.

## 2. Sales Tax / VAT / GST
**Inputs:** amount ≥0; user-entered rate; exclusive/inclusive mode; quantity ≥1; editable tax label.
**Outputs:** taxable base, tax and gross per unit; tax and gross total for quantity.
**Formula:** exclusive (T=B×r, G=B+T); inclusive (B=G/(1+r), T=G-B), r decimal.
**Edges:** zero rate/amount valid; inclusive zero rate gives base=gross and tax 0. Reject negative values/unsupported rates. Blank rate is not legal zero. Explicit rounding; no intermediate rounding.
**Never hardcode:** jurisdiction, product category, exemptions, thresholds, tax-on-tax, statutory rates or filing rules.
**Excel:** exclusive tax `=A2*B2/100`, gross `=A2+C2`; inclusive base `=A2/(1+B2/100)`, tax `=A2-D2`.
**Examples:** exclusive 1,000 at 18% → tax 180, gross 1,180. Inclusive 1,180 at 18% → base 1,000, tax 180.

## 3. NPV
**Inputs:** discount rate per period; initial time-zero flow; ordered future flows at equal intervals; period label (month/quarter/year).
**Outputs:** PV of future flows, initial flow, NPV and optional discounted schedule.
**Formula:** (NPV=CF_0+Σ_{t=1}^{n}CF_t/(1+r)^t). Spreadsheet NPV discounts the first listed future flow as period 1; add initial flow separately.
**Edges:** standard discrete rate >−100%; zero rate sums flows; negative flows valid; empty series invalid/explicitly zero; unequal dates require XNPV. Detect overflow and disclose period basis.
**Never hardcode:** hurdle rate, inflation, risk premium, dates, currency or advice.
**Excel:** `=A2+NPV(rate,B2:F2)` (A2 initial; B2:F2 future).
**Examples:** −1,000; +600,+600; 10% → NPV ≈41.32. −2,000; +1,000,+1,000,+500; 0% → 500.

## 4. APR
**Inputs:** principal/net proceeds; nominal annual rate; term; payment frequency; included upfront/financed fees; payment timing.
**Outputs:** periodic payment, total payments, interest, fee-inclusive annualized borrowing rate, total credit cost.
**Formula:** (PMT=P×i/[1-(1+i)^{-n}]). APR-style rate solves periodic rate whose payment-stream PV equals net proceeds after included fees; annualize under a declared convention. Nominal rate alone is not APR.
**Edges:** zero interest = principal/count; reject non-positive term/count, negative principal, fees exceeding proceeds and unsolvable flows. Show fee inclusion and timing.
**Never hardcode:** statutory APR method, fee categories, legal thresholds or rounding. Label generic result estimate unless jurisdiction-specific method is sourced/versioned.
**Excel:** `=PMT(nominal_rate/payments_per_year,term_years*payments_per_year,principal)`; periodic estimate `=RATE(n,-payment,net_proceeds)`; effective annual `=(1+periodic_rate)^payments_per_year-1`.
**Examples:** 10,000 at 12%, 12 monthly payments, no fees → payment ≈888.49; total ≈10,661.85. Same loan with 120 upfront fee → payment unchanged; APR estimate rises because net proceeds are 9,880.

## 5. Margin / Markup
**Inputs:** revenue/selling price; COGS/unit cost; optional operating expenses; optional target margin.
**Outputs:** gross profit/margin, net profit/margin, markup, optional selling price for target margin.
**Formula:** gross profit (R-C); gross margin ((R-C)/R×100); net profit (R-C-E); net margin ((R-C-E)/R×100); markup ((R-C)/C×100); target price (C/(1-m)).
**Edges:** revenue 0 makes margin undefined; COGS 0 makes markup undefined. Show unavailable/validation, never fake 0%. Negative profit valid. Target margin <100%. Margin denominator is revenue; markup denominator is cost.
**Never hardcode:** industry benchmarks, tax, currency or accounting treatment.
**Excel:** `=(A2-B2)/A2*100`; `=(A2-B2-C2)/A2*100`; `=(A2-B2)/B2*100`.
**Examples:** revenue 50,000; COGS 20,000; expenses 5,000 → gross margin 60%, net margin 50%, markup 150%. Revenue 50,000; COGS 60,000; expenses 5,000 → gross margin −20%, net margin −30%, markup −16.67%.

## 6. Commission
**Inputs:** commissionable sales; rate; optional user-configured tiers, fixed base/bonus, split/team allocation.
**Outputs:** commissionable sales, tier breakdown, commission, total compensation, effective rate.
**Formula:** flat (sales×rate); marginal tiers sum each eligible slice × tier rate; split = commission × split%; effective rate = commission/sales if sales nonzero.
**Edges:** reject negative sales and invalid rates/splits. Declare marginal vs retroactive tiers. Zero sales → zero commission and unavailable effective rate. Refunds/clawbacks excluded unless modeled.
**Never hardcode:** employer plan, quota, accelerators, territory, withholding, clawbacks or currency.
**Excel:** flat `=A2*B2/100`; split `=A2*B2/100*C2/100`; marginal tiers use one row per eligible slice.
**Examples:** sales 20,000 at 5% → 1,000. First 10,000 at 2%, next 20,000 at 4%, remaining 20,000 at 6% → 200+800+1,200=2,200.

## Shared cash-flow engine (separate spec)
Canonical flow = amount, period index or ISO date, display currency metadata (never arithmetic), optional label. NPV accepts any signs; IRR/XIRR requires at least one negative and positive flow. Equal-period NPV uses discrete periods; dated XNPV/XIRR declares day-count convention (365 only when selected). Preserve date/flow pairing; do not infer dates; define same-day aggregation. IRR may have multiple/no roots: surface ambiguity/non-convergence. Solver exposes tolerance, iteration cap and convergence state. Independent references: Excel `NPV`, `IRR`, `XNPV`, `XIRR` plus separately written numerical solver. Test irregular dates, multiple sign changes, no root, zero rate, extreme magnitudes, long horizons and precision.
