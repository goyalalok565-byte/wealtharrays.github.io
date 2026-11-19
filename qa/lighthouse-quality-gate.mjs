import fs from 'node:fs';

const file = process.argv[2] || '/tmp/wa-lighthouse/summary.json';
const summary = JSON.parse(fs.readFileSync(file, 'utf8'));
const rows = summary.rows || [];
if (rows.length !== 7) throw new Error(`Expected seven Lighthouse routes, found ${rows.length}`);

const floors = { performance: 70, accessibility: 95, bestPractices: 80, seo: 90 };
const maxCLS = 0.25;
const failures = [];

for (const row of rows) {
  for (const [metric, floor] of Object.entries(floors)) {
    const value = Number(row[metric]);
    if (!Number.isFinite(value) || value < floor) {
      failures.push(`${row.route}: ${metric} ${row[metric]} is below the minimum ${floor}`);
    }
  }
  const cls = Number.parseFloat(row.cls);
  if (!Number.isFinite(cls) || cls > maxCLS) {
    failures.push(`${row.route}: CLS ${row.cls} exceeds the maximum ${maxCLS}`);
  }
}

console.log('Mobile Lighthouse release floors: performance ≥70, accessibility ≥95, best practices ≥80, SEO ≥90, CLS ≤0.25.');
console.log('Longer-term product target: performance ≥90 and CLS ≤0.10 on every core route.');
if (failures.length) {
  console.error('MOBILE QUALITY GATE FAILED (' + failures.length + ' issues)');
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('MOBILE QUALITY GATE PASS — all seven routes meet the minimum release floors.');
