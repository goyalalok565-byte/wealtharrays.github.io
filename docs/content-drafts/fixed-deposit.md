# Fixed Deposit Calculator

> Content draft only. Not wired into any calculator page or production route. Last reviewed: 2026-11-21. All examples are illustrative arithmetic, not product quotes or personalized advice.

## Overview

A fixed deposit (FD) places a lump sum with a bank for a defined term and contracted interest method. The projection below is a mathematical estimate, not a bank quote. Actual maturity proceeds depend on the bank’s compounding convention, payout choice, day-count, premature-withdrawal terms and applicable tax treatment. Enter the rate and frequency shown in the deposit offer; do not assume every FD compounds quarterly or pays the same rate.

## How the estimate works

For periodic compounding, maturity = principal × (1 + annual nominal rate ÷ compounding periods per year)^(periods per year × years). Estimated interest = maturity − principal. This assumes the quoted rate remains applicable for the full term and no interim payout or penalty.

## Worked examples

- ₹100,000 at 7% nominal, compounded quarterly for 5 years: maturity ≈ ₹141,478; estimated interest ≈ ₹41,478.
- ₹250,000 at 6% nominal, compounded monthly for 3 years: maturity ≈ ₹299,170; estimated interest ≈ ₹49,170.

## Frequently asked questions

- **Does an FD rate stay fixed?** A fixed-rate deposit generally uses its contracted rate for its booked term; verify the actual receipt and product conditions.
- **Is compounding always quarterly?** No. Frequency and payout method are product-specific; use the terms disclosed by the bank.
- **Can I withdraw early?** Premature withdrawal may reduce interest or attract a penalty under the bank’s disclosed policy.
- **Is the maturity amount tax-free?** Do not assume so. Tax treatment depends on the depositor’s jurisdiction and circumstances.
- **Is this a guaranteed bank quote?** No. It is an estimate from inputs; the bank’s contract and maturity advice control.

## Common mistakes to avoid

Use the bank’s contracted rate, compounding and term; do not compare headline rates without checking payout and premature-closure conditions. Do not confuse nominal interest with effective annual yield. Keep tax, withholding and deposit-insurance treatment outside this generic formula unless a dated jurisdiction-specific module is separately reviewed.

## Official references reviewed

- [RBI — FAQs on Interest Rate on Deposits Directions, 2025](https://www.rbi.org.in/commonman/Upload/English/FAQs/PDFs/FAQIRD01042025.pdf)
- [RBI — Interest Rate on Deposits Directions, 2025](https://www.rbi.org.in/scripts/NotificationUser.aspx?Id=13157)
- [SEBI Investor — Power of Compounding](https://investor.sebi.gov.in/moneymatters-powerofcom.html)

## Editorial and implementation notes

- Keep the calculation deterministic and disclose every assumption and timing convention.
- Country-specific legal, tax, labour, lender and product rules must be separately sourced, dated, scoped and tested before they are added.
- Do not turn illustrative assumptions into default recommendations or guaranteed outcomes.
- Draft is not wired to the site; page copy, metadata, schema and internal links require a separate reviewed wiring PR.
