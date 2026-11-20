# India tax-year terminology and official sources

This note is a terminology map, not a tax opinion. The calculator must never transfer a section number between tax years.

## Assessment Year 2026–27 (income earned in FY 2025–26)

- Applicable law: Income-tax Act, 1961.
- Rebate reference: Section 87A.
- AY 2026–27 and earlier filings remain governed by the 1961 Act, even if filing/payment occurs after 1 April 2026.

Official references:
- [Income Tax Department — Income Tax Returns: AY 2026–27 filings and governing Act](https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/income-tax-returns)
- [Income Tax Department — ITR-2 online: AY 2026–27 rebate under Section 87A](https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/file-itr-2-online)
- [Income Tax Department — salaried individuals for AY 2026–27](https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1?mobile-app=1)

## Tax Year 2026–27 (period beginning 1 April 2026)

- Applicable law: Income-tax Act, 2025.
- Rebate reference: Section 156.
- The current India new-regime calculator widget is explicitly scoped to Tax Year 2026–27 and therefore uses Section 156 terminology only.

Official references:
- [Income Tax Department — Income and Tax Estimator manual: Tax Year 2026–27 uses the 2025 Act; AY 2026–27 requires selecting the 1961 Act](https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/income-and-tax-estimator-um)
- [Income-tax Act, 2025 — official Section 156 text (Income Tax Department PDF)](https://wmstatic-prd.incometaxindia.gov.in/documents/20117/42998/Section-156_2026-04-01_05-11-58_344893_en.pdf/415b0f0e-8826-feaa-b374-481e54d4b98e?t=1775046534568&version=9.0)
- [Income Tax Department — tax rates and computation](https://wm.incometaxindia.gov.in/w/tax-rates-and-computation)

## Implementation guardrails

- The widget/runtime may say “Section 156 rebate eligibility (Tax Year 2026–27)”.
- The Tax Year 2026–27 widget must not label its rebate field Section 87A.
- Any future AY 2026–27 calculator must explicitly select the Income-tax Act, 1961 and use Section 87A references.
- These are statutory terminology references only. Rebate eligibility, income thresholds, special-rate income, marginal relief and calculations still require a separately reviewed model and CA/legal approval before production use.
