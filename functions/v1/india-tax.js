import { CORS_HEADERS, error, json } from "./_shared.js";
const VERSION = "2026-27-new-regime-v1";
const SLABS = [
  { limit: 400000, rate: 0 },
  { limit: 800000, rate: 0.05 },
  { limit: 1200000, rate: 0.10 },
  { limit: 1600000, rate: 0.15 },
  { limit: 2000000, rate: 0.20 },
  { limit: 2400000, rate: 0.25 },
  { limit: Infinity, rate: 0.30 }
];
const slabTax = income => {
  let tax = 0, lower = 0;
  for (const slab of SLABS) {
    const taxable = Math.max(0, Math.min(income, slab.limit) - lower);
    tax += taxable * slab.rate;
    if (income <= slab.limit) break;
    lower = slab.limit;
  }
  return tax;
};
const surchargeRate = income => income > 50000000 ? 0.25 : income > 20000000 ? 0.25 : income > 10000000 ? 0.15 : income > 5000000 ? 0.10 : 0;
const surchargeThreshold = income => income > 50000000 ? { limit: 50000000, prior: 0.25 } : income > 20000000 ? { limit: 20000000, prior: 0.15 } : income > 10000000 ? { limit: 10000000, prior: 0.10 } : income > 5000000 ? { limit: 5000000, prior: 0 } : null;
function compute(taxableIncome, rebateEligible) {
  const grossTax = slabTax(taxableIncome);
  let rebate = 0;
  if (rebateEligible) {
    if (taxableIncome <= 1200000) rebate = Math.min(grossTax, 60000);
    else if (grossTax > taxableIncome - 1200000) rebate = grossTax - (taxableIncome - 1200000);
  }
  const afterRebate = Math.max(0, grossTax - rebate);
  let surcharge = afterRebate * surchargeRate(taxableIncome);
  const threshold = surchargeThreshold(taxableIncome);
  if (threshold) {
    const taxAtThreshold = Math.max(0, slabTax(threshold.limit) - (threshold.limit <= 1200000 ? Math.min(slabTax(threshold.limit), 60000) : 0));
    const ceiling = taxAtThreshold * (1 + threshold.prior) + (taxableIncome - threshold.limit);
    surcharge = Math.min(surcharge, Math.max(0, ceiling - afterRebate));
  }
  const taxPlusSurcharge = afterRebate + surcharge;
  const cess = taxPlusSurcharge * 0.04;
  return { grossTax, rebate, surcharge, cess, totalTax: taxPlusSurcharge + cess, effectiveRate: taxableIncome > 0 ? (taxPlusSurcharge + cess) / taxableIncome * 100 : 0 };
}
export async function onRequestOptions() { return new Response(null, { status: 204, headers: CORS_HEADERS }); }
export async function onRequestPost({ request }) {
  let body;
  try { body = await request.json(); } catch { return error("INVALID_JSON", "Request body must be valid JSON.", 400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return error("INVALID_REQUEST", "Provide a JSON object.", 400);
  const year = body.tax_year || "2026-27", regime = body.regime || "new";
  if (year !== "2026-27" || regime !== "new") return error("UNSUPPORTED_TAX_RULE", "Only the reviewed Indian new-regime model for tax year 2026-27 is currently supported.", 422, { supported_tax_year: "2026-27", supported_regime: "new", model_version: VERSION });
  const income = body.taxable_income;
  if (typeof income !== "number" || !Number.isFinite(income) || income < 0 || income > 1e9) return error("INVALID_TAXABLE_INCOME", "taxable_income must be a finite number between ₹0 and ₹100 crore.", 400, { field: "taxable_income" });
  const output = compute(income, body.rebate_eligible);
  return json({
    tax_year: year, regime, model_version: VERSION, taxable_income: income, rebate_eligible: body.rebate_eligible,
    results: [
      { label: "Tax before rebate", value: output.grossTax, format: "currency" },
      { label: "Section 87A rebate / marginal relief", value: output.rebate, format: "currency" },
      { label: "Surcharge after marginal relief", value: output.surcharge, format: "currency" },
      { label: "Health and Education Cess (4%)", value: output.cess, format: "currency" },
      { label: "Estimated total tax", value: output.totalTax, format: "currency", emphasis: "positive" },
      { label: "Effective tax rate", value: output.effectiveRate, format: "percent" }
    ],
    assumptions: {
      income_basis: "Taxable income after eligible deductions; do not pass gross salary unless deductions have already been accounted for.",
      slabs: SLABS.map(s => ({ upper_limit: Number.isFinite(s.limit) ? s.limit : null, rate: s.rate })),
      standard_deduction: "Not applied automatically. If applicable, subtract the eligible amount before submitting taxable_income.",
      rebate_eligibility: "Section 87A rebate and rebate-related marginal relief are applied only when rebate_eligible is true; eligibility is supplied by the caller and is not independently verified.",
      excludes: ["special-rate income such as certain capital gains or winnings", "tax credits other than the implemented Section 87A rebate", "individual-specific deductions and exemptions", "advance tax, TDS and interest"],
      source: "Income Tax Department, tax rates and computation, current rules for tax year 2026-27; confirm with current official guidance before filing.",
      source_url: "https://www.incometaxindia.gov.in/w/tax-rates-and-computation"
    },
    metadata: { calculated_at: new Date().toISOString(), deterministic: true, not_for_filing: true }
  }, 200, { "Cache-Control": "no-store" });
}
