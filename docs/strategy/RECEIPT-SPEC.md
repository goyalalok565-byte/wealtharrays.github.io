# Verified Receipt — implementation specification

**Status:** specification only; no UI or runtime behaviour is claimed shipped by this document.  
**Initial rollout:** SIP, EMI, compound interest, SWP, rent-vs-buy; then expand by registry.

## 1. User promise

A receipt makes a result reproducible and inspectable. It is not a guarantee of future returns, a professional opinion, or proof that an input is true. “Verified” means the result was produced by the identified deterministic model and matched the published test suite at the stated build. Never use this label if required evidence is missing.

## 2. Result panel

Place an accessible **How this was calculated** disclosure directly below the result. It must show:

- Formula in plain language, with a concise mathematical expression where useful.
- All calculation assumptions, visibly distinguished from user inputs. Editable assumptions must update the calculation through the same canonical engine; no shadow formula in the panel.
- Source title, URL, jurisdiction and effective-from date for any jurisdiction-dependent rule. For generic math with no external rule, explicitly say “No jurisdictional rule used”.
- model_id, immutable model_version, schema/version and build identifier.
- “Independent tests: N cases”, generated from a checked-in test manifest/registry at build time. N is the number of distinct, named, relevant test vectors actually executed for that model in the current build—not total repository tests, a hard-coded marketing number, or a count of assertions. Missing manifest, zero vectors or failed vectors suppress verified state.
- “Copy verified receipt” exports readable text and canonical JSON.
- “Report an error” sends page/model/build identifiers and error category only. Never attach entered values, outputs, receipt JSON, URL query parameters containing values, cookies, identifiers or free text by default. Do not prefill financial inputs.

## 3. Canonical receipt JSON

Version the schema independently. Required fields:

- receipt_schema_version
- model_id, model_version, build_id
- calculator_slug
- created_at (UTC ISO 8601)
- jurisdiction (ISO code or null), rule_version and effective_from (or null)
- formula_id and human-readable formula_summary
- inputs and assumptions, each typed, unit-labelled and normalized
- outputs, typed, unit-labelled and normalized
- rounding_policy, currency/locale where relevant
- source_refs: title, canonical URL, publisher, published/updated date if known, effective date if applicable, and retrieval/verification date
- test_evidence: manifest version, distinct case count, suite/build reference and pass status
- integrity: algorithm and digest

No personal identity, account ID, email, IP address, bank data or analytics identifiers belong in a receipt.

## 4. Hash contract

Use SHA-256 over canonical serialization of the calculation payload: model_id, model_version, normalized inputs, normalized assumptions, normalized outputs, units, jurisdiction/rule version and rounding policy. Exclude timestamp, display labels, source retrieval time, user identity and analytics metadata so the digest is stable for identical calculation facts.

- Canonicalize object keys deterministically (RFC 8785 JSON Canonicalization Scheme or a documented equivalent); reject NaN/Infinity and ambiguous numeric encodings.
- Normalize decimal values using the engine's documented precision/rounding policy before serialization. Never hash locale-formatted display strings.
- Label the digest “SHA-256 calculation fingerprint”; it is an integrity fingerprint, not a digital signature and not proof of authorship or source authenticity.
- Hash locally in the browser where possible. If a server computes it, transmit only what the selected calculator/API contract requires and document retention; never silently send values to analytics.
- Provide a verification routine that recomputes the digest from the exported payload and a test vector for every supported receipt schema version.

## 5. Model and source versioning

- Formula/model versions are immutable. A behaviour change increments model_version; old receipts remain interpretable.
- Source records distinguish publication/update date, effective-from date and last verification date. Do not treat these dates as interchangeable.
- If an official source has no explicit effective date, record null and explain that the date was not stated.
- A source update that does not change math updates source metadata; a rule change requires new model/rule version and regression vectors.
- Historical receipts must not silently recalculate under a new model.

## 6. Independent test evidence

Maintain a manifest keyed by model_id and model_version. Each case has a stable unique ID, independent expected value/source, input vector, tolerance/rounding policy and category (golden, boundary, zero, invalid, property-derived). Count distinct case IDs executed successfully in the current build. Do not count multiple assertions in one case as multiple cases. Do not count the implementation's own output as an independent expected value.

Required coverage before a model displays a receipt:
- At least one independently sourced golden vector.
- Boundary and invalid-input cases.
- Zero/blank distinction where applicable.
- Unit and rounding checks.
- Deterministic replay test.
- Cross-surface parity test where an API model exists.

If a test is skipped, flaky, stale or fails, displayed count/status must reflect that; do not label it passed.

## 7. Accessibility and privacy

- Use a native disclosure pattern or equivalent keyboard-operable control with visible focus, correct accessible name/state, and logical heading order.
- Announce receipt-copy success/failure through an accessible status region; do not move focus unexpectedly.
- Ensure 200% zoom, narrow mobile viewport, high contrast and reduced-motion behaviour.
- Report-error flow must warn: “Do not include amounts, account details, tax IDs or other personal financial information.”
- Automated tests must inspect network requests, analytics payloads, error-report payloads, browser storage and URL parameters to prove inputs/outputs are not transmitted or persisted unexpectedly.
- Do not display a “Privacy” badge until those tests pass on the shipped build.

## 8. Release gates

A receipt PR is mergeable only when:
1. Canonical engine is the sole source of numeric output.
2. Snapshot tests cover receipt JSON and readable text.
3. SHA-256 canonicalization test vectors pass in browser and Node environments.
4. Test count is generated from the executed model-specific manifest; a mutation test proves a missing/failed vector suppresses verified state.
5. Keyboard/screen-reader/a11y checks pass.
6. Mobile Lighthouse gate is green for the agreed route set; skipped is not a pass.
7. Privacy/network audit proves no financial inputs in analytics or error reporting.
8. Required CI and tier-specific review gates are green.

## 9. Initial rollout sequence

One calculator per PR or a small independently reviewable group: SIP → EMI → compound interest → SWP → rent-vs-buy. Each PR includes its own golden vectors, assumptions, source metadata and page-level/browser tests. Do not add the verified panel to all registry entries until each model has sufficient evidence.

## 10. Explicit non-goals

- No financial recommendation or personalized investment advice.
- No AI-generated formula, result, assumption or source date.
- No claiming external auditor/CA/legal approval.
- No signature, blockchain, or tamper-proof guarantee.
- No forced signup to calculate or copy a local receipt.
