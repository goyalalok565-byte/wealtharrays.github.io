# Wealth Arrays — Product North Star & 10-Year Operating Strategy

Last updated: 2026-11-23
Status: strategy baseline; execution is gated by evidence, privacy, security and owner-only approvals.

## 1. Mission

Make consequential money decisions easier to understand, compare, verify and revisit. Wealth Arrays is a financial decision workspace, not merely a directory of calculators and not an autonomous investment adviser.

**Promise:** every important number is reproducible; every assumption is visible; every source has a date and jurisdiction; every AI explanation is grounded in a versioned calculation or a clearly labelled uncertainty.

We do not promise to be "number one" by assertion. We earn category leadership through accuracy, trust, usefulness, retention, accessibility, distribution and sustainable unit economics.

## 2. Category and competitive position

The market has distinct product clusters:
- Calculator and publisher sites compete on free breadth, SEO coverage and lead generation (e.g. Calculator.net, Bankrate, NerdWallet).
- Personal-finance apps compete on connected accounts, budgets, household workflows and transaction automation (e.g. Monarch, Copilot Money, Rocket Money, YNAB).
- AI finance assistants compete on conversational access, summaries, coaching and increasingly agentic actions (e.g. Cleo, Origin and general-purpose assistants).

Our wedge is the bridge between a one-off calculator and an account-connected money app:
1. Free, high-quality, no-login calculations.
2. Side-by-side scenario comparisons and sensitivity analysis.
3. Saveable, versioned decision records and shareable reports.
4. Explainable AI that turns plain-language goals into transparent, editable scenarios.
5. Gradual workspace and professional/API capabilities, only after trust and security gates.

Do not copy competitor features without user evidence. Win a narrow wedge first: decisions people repeatedly calculate, compare, explain to a partner/adviser, and revisit.

## 3. Product pillars

### A. Deterministic calculation kernel
- Pure functions with explicit input/output schemas; no network or AI dependency in the calculation path.
- Formula IDs, semantic versions, units, rounding policy, domain constraints and test vectors.
- Currency is display metadata unless an explicitly versioned FX data source is used.
- Tax, legal, lending and benefit rules require jurisdiction + effective date + authoritative citation + review status.
- Preserve undefined as undefined; never turn divide-by-zero, missing inputs or non-convergence into fake zero.
- Golden vectors, property tests, boundary tests, independent spreadsheet/reference checks and reproducible regression fixtures.

### B. Decision workspace
- Scenario snapshots include inputs, outputs, formula version, assumptions, source versions, created/updated time and user labels.
- Compare baseline against alternatives; show absolute and percentage deltas and sensitivity to key assumptions.
- Export portable CSV/XLSX/PDF/JSON; users can delete/export their data.
- Free remains useful without an account. Cloud save and paid features are optional, never a dark pattern.

### C. Explainable AI copilot
AI is a translator/orchestrator, not the source of financial truth.
- Parse intent into a typed plan: goal, jurisdiction, time horizon, inputs required and missing data.
- Ask only for missing material inputs; never invent values.
- Call allow-listed deterministic calculators and scenario APIs.
- Return structured outputs, assumptions, formula/version, source links, uncertainty and what could change the result.
- Show "why this result" and "what if" controls.
- Distinguish arithmetic, estimates, forecasts and regulated advice. No buy/sell/credit/tax/legal instruction.
- Require explicit confirmation before saving, sharing, exporting, sending or changing account state.
- Never send raw financial inputs to analytics or advertising systems.
- Model-provider abstraction: interchangeable models, tool schemas and evaluation suite; no single model vendor lock-in.
- Treat retrieved documents and user uploads as untrusted data, never as instructions.

### D. Data and source intelligence
- Source registry: publisher, canonical URL, jurisdiction, topic, effective-from/to, retrieval date, content hash, reviewer and status.
- No scraped rate or tax assumption becomes a default until source validation and a freshness policy exist.
- Show stale/unknown status rather than silently using old values.
- Start with user-entered assumptions and official public references; add licensed data only when terms, coverage and economics are verified.

### E. Trust, security and privacy
- Data minimisation, encryption in transit/at rest, strict tenant isolation, least privilege and auditable access.
- Explicit consent, purpose limitation, retention/deletion/export, incident response and tested backups.
- No bank connection or credential collection until regulated-provider, privacy, security and jurisdictional reviews are complete.
- Server-side entitlements; never trust client-only Pro flags.
- Threat model and independent security review before financial account integrations.
- AI outputs are advisory explanations, not a substitute for qualified professionals.

### F. Developer and professional platform
- Stable, versioned API with idempotency, rate limits, clear quotas, typed errors and audit IDs.
- SDKs and embeddable calculators only after API parity and golden-vector evidence.
- Professional workspace: client-approved scenarios, branded reports, notes, permissions and immutable audit history.
- Never expose private user records through public endpoints or training pipelines by default.

## 4. 10-year durability principles (2027–2036)

1. **Portable core:** calculation kernel and schemas are independent of UI, database and AI provider.
2. **Version everything:** formulas, tax rules, data sources, API contracts, report templates and prompts/evaluation sets.
3. **Open formats:** export user data in documented JSON/CSV; avoid lock-in.
4. **Modular architecture:** begin with a well-tested modular monolith and clear boundaries; split services only when load/team ownership justifies it.
5. **Replaceable infrastructure:** standard SQL, object storage, queues and OpenAPI; adapters isolate vendors.
6. **AI optionality:** users can use the product without AI; AI providers can be replaced without rewriting calculation logic.
7. **Accessibility and localization:** keyboard/screen-reader support, locale-aware number/date/currency, language packs and jurisdiction-specific rule packs.
8. **Backward compatibility:** documented migrations, deprecation windows, replayable historical scenarios and restore drills.
9. **Security by design:** regular dependency updates, SBOM, threat modelling, abuse limits, incident drills and external testing.
10. **Evidence over hype:** no claims of global rank, guaranteed outcomes, field performance or revenue without independent measurements.

## 5. Product sequence and release gates

### Phase A — Trustworthy free calculator platform
- Resolve 55-registry / sitemap parity.
- Complete the first six requested calculators: Discount; Sales Tax/VAT/GST (user-rate only); NPV; generic APR estimate; Margin/Markup; Commission.
- Every calculator receives formula documentation, worked examples, FAQs, source/assumption notes and independent golden vectors.
- Audit every existing calculator for domain validity, accessibility, localization and mobile performance.
- Gate: CI, browser smoke, independent formula vectors, no Sev-1 defects.

### Phase B — Decision workspace MVP
- Free: calculators, limited scenario save, two-way comparison, useful exports.
- Pro candidate: verified-email account, cloud scenarios, five-way comparison, goal planner, report history and higher API quota.
- Trial only after abuse prevention, deletion/export, server entitlements and end-to-end payment tests.
- Gate: owner-managed TEST credentials, signup/verification/login/save/subscribe/entitlement/cancel/failure/refund/duplicate/out-of-order webhook tests; backups and restore; privacy/legal review.
- Ultra remains invite/waitlist until there is a real professional workflow and support capacity.

### Phase C — AI Decision Copilot
- Read-only first. User supplies assumptions or imports a file voluntarily.
- Intent → typed plan → deterministic tools → result validation → cited explanation.
- Evaluation suite for arithmetic consistency, missing-input behavior, citation accuracy, hallucinations, prompt injection, privacy leakage and unsafe advice.
- Gate: AI may not publish a numeric result unless it exactly matches the deterministic tool response; uncertainty and jurisdiction must be explicit.

### Phase D — Global and professional expansion
- Add jurisdiction packs only with official source mapping, effective dates and expert review.
- Add bank data only through vetted licensed aggregators and only in supported markets.
- Add professional/API features after service-level, support, security and legal readiness.
- Expand languages and currencies based on demand, not just translation volume.

## 6. First execution backlog (priority order)

P0:
1. Reconcile current main SHA, post-merge deployment and live verification for PR #148.
2. Resolve registry/sitemap mismatch (55 definitions vs 54 listed routes) with an automated invariant.
3. Rebase/revalidate the Tier-3 backend hardening candidate; keep it draft until owner TEST setup and full lifecycle evidence exist.
4. Implement Batch 1 six calculators in small PRs with independent reference vectors.
5. Complete analytics consent and field-performance validation; never collect money values or account identifiers in analytics.
6. Publish owner setup runbook for Cloudflare/D1/Supabase/Turnstile/Razorpay TEST without secrets in source control.

P1:
7. Complete remaining 43 page-specific editorial/source reviews in measured batches.
8. Build scenario data model, compare engine and portable exports.
9. Build AI copilot read-only prototype only after deterministic tool schemas and evaluation harness.
10. Establish support, incident, deletion/export and restore operations.

P2:
11. Global jurisdiction packs, professional workspace, public API/SDK, integrations and multilingual UX.

## 7. Scorecard — reviewed monthly

North-star outcome: percentage of active users who complete a financial decision workflow and return to review/update it within 30 days.

Guardrails:
- Calculation correctness: 100% of release golden vectors pass; zero known critical formula defects.
- AI numeric fidelity: 100% of surfaced numeric outputs match the invoked deterministic tools.
- Privacy: zero financial inputs/account identifiers in analytics payloads.
- Reliability: uptime, p95 latency, error rate, restore success and incident MTTR measured from production.
- Activation: calculator completion → scenario comparison → saved decision → return.
- Retention: 7/30/90-day cohort retention, not raw signups.
- Monetization: paid conversion, churn, refunds, gross margin and support cost.
- Acquisition: non-brand search, referrals, professional/API usage and channel-level CAC.
- Trust: user-reported clarity, correction rate, support resolution and source freshness.

Do not invent targets before collecting a reliable baseline. Set targets after four weeks of valid instrumentation.

## 8. Owner-only / external gates

The engineering agent may prepare code, documentation, test plans and draft policies. It must not:
- Request or write secret values into chat, code or docs.
- Enable live Razorpay/Paddle payments, public checkout, paid entitlements or migrations without required owner confirmation.
- Claim CA/lawyer approval, tax correctness, regulatory compliance, bank-data permission or merchant approval.
- Publish legal terms as lawyer-approved.
- Spend money, sign vendor contracts, contact customers, or make irreversible account changes without explicit authorization.

Owner tasks: configure provider secrets in provider dashboards; complete KYC; appoint CA/lawyer; approve privacy/legal copy; approve any production migration and commercial go-live in writing.

## 9. Decision rule

Choose the smallest reversible change that measurably improves user outcomes. Prefer correctness, clarity, portability and trust over feature count. Every release must have: problem statement, owner, source of truth, acceptance tests, rollback plan, evidence and explicit release status.
