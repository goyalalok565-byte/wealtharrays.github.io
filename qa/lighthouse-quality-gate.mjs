import fs from 'node:fs';

export const THRESHOLDS = Object.freeze({ performance: 90, cls: 0.10, tbtMs: 200, lcpMs: 2500, accessibility: 95, bestPractices: 80, seo: 90 });

export function evaluateSummary(summary) {
  const rows = summary?.rows || [];
  const failures = [];
  if (rows.length !== 7) failures.push(`Expected seven Lighthouse routes, found ${rows.length}`);
  for (const row of rows) {
    const route = row.route || '(unknown route)';
    for (const metric of ['performance', 'accessibility', 'bestPractices', 'seo']) {
      const value = Number(row[metric]);
      if (!Number.isFinite(value) || value < THRESHOLDS[metric]) failures.push(`${route}: ${metric} ${row[metric]} is below minimum ${THRESHOLDS[metric]}`);
    }
    const cls = Number(row.clsValue);
    if (row.clsValue == null || !Number.isFinite(cls) || cls > THRESHOLDS.cls) failures.push(`${route}: CLS ${row.clsValue} exceeds maximum ${THRESHOLDS.cls}`);
    const tbt = Number(row.tbtMs);
    if (row.tbtMs == null || !Number.isFinite(tbt) || tbt > THRESHOLDS.tbtMs) failures.push(`${route}: TBT ${row.tbtMs}ms exceeds maximum ${THRESHOLDS.tbtMs}ms`);
    const lcp = Number(row.lcpMs);
    if (row.lcpMs == null || !Number.isFinite(lcp) || lcp > THRESHOLDS.lcpMs) failures.push(`${route}: LCP ${row.lcpMs}ms exceeds maximum ${THRESHOLDS.lcpMs}ms`);
  }
  return failures;
}
if (process.argv[1] && process.argv[1].endsWith('lighthouse-quality-gate.mjs')) {
  const file = process.argv[2] || '/tmp/wa-lighthouse/summary.json';
  const summary = JSON.parse(fs.readFileSync(file, 'utf8'));
  const failures = evaluateSummary(summary);
  console.log('Mobile release thresholds: Performance ≥90, CLS ≤0.10, TBT ≤200ms, LCP ≤2500ms; accessibility ≥95, best practices ≥80, SEO ≥90.');
  if (failures.length) {
    console.error('MOBILE RELEASE GATE FAILED (' + failures.length + ' issues)');
    console.error(failures.join('\\n'));
    process.exit(1);
  }
  console.log('MOBILE RELEASE GATE PASS — all seven routes meet every release threshold.');
}
