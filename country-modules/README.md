# Wealth Arrays Country Module Contract

Country modules are optional rule layers. They must never alter the global deterministic math engine directly.

## Separation
- Core engine: universal arithmetic, compounding, cash-flow timing, inflation adjustment and scenario mechanics.
- Country module: currency metadata, terminology, tax-rule metadata, retirement-system metadata, contribution limits and jurisdiction-specific disclosures.
- Product UI: consumes a country module but must label the jurisdiction and effective date.

## Required metadata
Every country module should declare:
- ISO country code
- supported currencies
- effective-from date
- source URLs and source publication/update dates
- rule version
- tax/retirement assumptions
- known exclusions
- last verification date

## Safety contract
- Never infer a tax result when the applicable jurisdiction/year is unknown.
- Never hard-code country tax rules into the universal engine.
- Every rule-changing release requires an equivalence/regression test.
- Historical rules must remain versioned when reproducibility requires them.
- Country modules are educational planning models, not tax filing software.

## Initial rollout order
India, United States, United Kingdom, United Arab Emirates, Canada, Australia and Singapore.

The first implementation should begin with metadata and source provenance, then move to country-specific calculations only when authoritative sources and QA coverage exist.
