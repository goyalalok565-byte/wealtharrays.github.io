# Recurring Deposit Calculator

> Content draft only. Not wired into any calculator page or production route. Last reviewed: 2026-11-21. All examples are illustrative arithmetic, not product quotes or personalized advice.

## Overview

A recurring deposit (RD) builds a deposit through repeated instalments, often monthly. The future value depends on when each instalment is credited and how the institution calculates interest. This draft uses an explicit end-of-month instalment convention for its examples; a bank may use a different product-specific method. Confirm the bank’s maturity schedule before relying on an estimate.

## How the estimate works

For equal end-of-period deposits, future value = payment × [((1 + i)^n − 1) ÷ i], where i is the periodic rate and n is the number of instalments. If i is zero, future value = payment × n. Beginning-period deposits require multiplying the annuity factor by (1 + i).

## Worked examples

- ₹5,000 at each month-end for 60 months, 7% nominal annual rate compounded monthly: maturity ≈ ₹357,000; deposits = ₹300,000; estimated interest ≈ ₹57,000.
- ₹2,000 monthly for 24 months at 0%: maturity = ₹48,000; interest = ₹0.

## Frequently asked questions

- **How is an RD different from an FD?** An FD starts with a lump sum; an RD accumulates instalments over time.
- **When is each instalment assumed to be deposited?** This example uses month-end payments; check the calculator’s timing convention.
- **Does the bank’s maturity match this estimate exactly?** Not necessarily; instalment dates, rounding and product rules can differ.
- **Can an instalment be late?** Late-payment charges or other consequences depend on the bank’s terms.
- **Is the displayed interest after tax?** No, unless tax is explicitly modelled for the relevant jurisdiction.

## Common mistakes to avoid

Do not use an FD lump-sum formula for recurring deposits. Do not assume instalments arrive at the start of each month when the model assumes month-end. Verify rate, due date, missed-instalment rules and maturity rounding in the bank’s terms.

## Official references reviewed

- [RBI — FAQs on Interest Rate on Deposits Directions, 2025](https://www.rbi.org.in/commonman/Upload/English/FAQs/PDFs/FAQIRD01042025.pdf)
- [RBI — Interest Rate on Deposits Directions, 2025](https://www.rbi.org.in/scripts/NotificationUser.aspx?Id=13157)
- [SEBI Investor — Power of Compounding](https://investor.sebi.gov.in/moneymatters-powerofcom.html)

## Editorial and implementation notes

- Keep the calculation deterministic and disclose every assumption and timing convention.
- Country-specific legal, tax, labour, lender and product rules must be separately sourced, dated, scoped and tested before they are added.
- Do not turn illustrative assumptions into default recommendations or guaranteed outcomes.
- Draft is not wired to the site; page copy, metadata, schema and internal links require a separate reviewed wiring PR.
