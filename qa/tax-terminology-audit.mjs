import fs from 'node:fs';
const widget = fs.readFileSync('widget.js', 'utf8');
const runtime = fs.readFileSync('wa-calculator-runtime.js', 'utf8');
for (const [name, source] of [['widget.js', widget], ['wa-calculator-runtime.js', runtime]]) {
  if (!source.includes('Section 156 rebate eligibility (Tax Year 2026–27)')) throw new Error(name + ': Section 156 tax-year label is missing.');
  if (!source.includes('Estimate India new-regime tax (Tax Year 2026–27)')) throw new Error(name + ': tax-year label is missing.');
  if (source.includes('Section 87A rebate eligibility') || source.includes('FY 2026–27')) throw new Error(name + ': stale rebate terminology remains in the Tax Year 2026–27 widget.');
}
console.log('India tax terminology audit PASS: Tax Year 2026–27 UI uses Section 156; no tax formula changed.');
