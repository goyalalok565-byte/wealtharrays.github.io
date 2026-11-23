# Personal Loan Calculator

> Content draft only. Not wired into any calculator page or production route. Last reviewed: 2026-11-21. All examples are illustrative arithmetic, not product quotes or personalized advice.

## Overview

A personal-loan estimate models a fixed principal repaid in equal instalments at a constant rate. It is a planning calculation, not an offer or eligibility decision. Processing fees, insurance, late charges, rate resets and disbursement deductions can change the effective cost. Compare the lender’s disclosed APR and repayment schedule before accepting credit.

## How the estimate works

For a standard amortising loan, EMI = P × r × (1+r)^n ÷ [(1+r)^n − 1], where r is the periodic interest rate and n is the number of payments. At zero interest, EMI = P ÷ n. Total interest = n × EMI − P.

## Worked examples

- Borrow ₹500,000 at 12% nominal annual interest for 60 months: EMI ≈ ₹11,122.22; total repayment ≈ ₹667,333.43; interest ≈ ₹167,333.43.
- Borrow ₹120,000 at 0% for 24 months: EMI = ₹5,000; total interest = ₹0.

## Frequently asked questions

- **What is the difference between interest rate and APR?** APR aims to include the annual cost of credit and relevant charges; use the applicable lender disclosure.
- **Does this include a processing fee?** Not unless separately entered; a fee can increase the effective cost.
- **Why does a longer term reduce EMI?** More instalments spread principal repayment over a longer period, often increasing total interest.
- **Can I repay early?** Check the contract for prepayment terms and charges.
- **Is this an approval estimate?** No. Lender underwriting and eligibility rules are separate.

## Common mistakes to avoid

Do not compare loans by EMI alone. Check net disbursed amount, all fees, APR, payment dates and prepayment conditions. Avoid entering a promotional rate as though it were a guaranteed personal offer.

## Official references reviewed

- [RBI — Key Facts Statement for Loans & Advances](https://rbi.org.in/Scripts/NotificationUser.aspx?Id=12663)
- [CFPB — Do personal installment loans have fees?](https://www.consumerfinance.gov/ask-cfpb/do-personal-installment-loans-have-fees-en-2120/)
- [CFPB — Difference between interest rate and APR](https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-loan-interest-rate-and-the-apr-en-733/)


## Editorial and implementation notes

- Keep the calculation deterministic and disclose every assumption and timing convention.
- Country-specific legal, tax, labour, lender and product rules must be separately sourced, dated, scoped and tested before they are added.
- Do not turn illustrative assumptions into default recommendations or guaranteed outcomes.
- Draft is not wired to the site; page copy, metadata, schema and internal links require a separate reviewed wiring PR.
