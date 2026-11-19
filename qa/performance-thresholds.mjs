export const PERFORMANCE_BUDGET = Object.freeze({ performanceMin: 90, clsMax: 0.1, tbtMsMax: 200, lcpMsMax: 2500 });
export function evaluatePerformanceRow(row, budget = PERFORMANCE_BUDGET) {
  const violations = [];
  if (!Number.isFinite(row.performance) || row.performance < budget.performanceMin) violations.push(`Performance ${row.performance ?? 'missing'} < ${budget.performanceMin}`);
  if (!Number.isFinite(row.cls) || row.cls > budget.clsMax) violations.push(`CLS ${row.cls ?? 'missing'} > ${budget.clsMax}`);
  if (!Number.isFinite(row.tbt) || row.tbt > budget.tbtMsMax) violations.push(`TBT ${row.tbt ?? 'missing'} ms > ${budget.tbtMsMax} ms`);
  if (!Number.isFinite(row.lcp) || row.lcp > budget.lcpMsMax) violations.push(`LCP ${row.lcp ?? 'missing'} ms > ${budget.lcpMsMax} ms`);
  return { gate: violations.length ? 'FAIL' : 'PASS', violations };
}
