import fs from 'node:fs';
const widget = fs.readFileSync('widget.js', 'utf8');
const runtime = fs.readFileSync('wa-calculator-runtime.js', 'utf8');
const sources = fs.readFileSync('docs/INDIA-TAX-YEAR-SOURCES.md', 'utf8');
for (const [name, source] of [['widget.js', widget], ['wa-calculator-runtime.js', runtime]]) {
  if (!source.includes('Section 156 rebate eligibility (Tax Year 2026–27)')) throw new Error(name + ': Section 156 tax-year label is missing.');
  if (!source.includes('Estimate India new-regime tax (Tax Year 2026–27)')) throw new Error(name + ': tax-year label is missing.');
  if (source.includes('Section 87A rebate eligibility') || source.includes('FY 2026–27')) throw new Error(name + ': stale rebate terminology remains in the Tax Year 2026–27 widget.');
}
if (!sources.includes('Assessment Year 2026–27 (income earned in FY 2025–26)') || !sources.includes('Section 87A')) throw new Error('Official source map must preserve AY 2026–27 / Section 87A under the 1961 Act.');
if (!sources.includes('Tax Year 2026–27 (period beginning 1 April 2026)') || !sources.includes('Section 156')) throw new Error('Official source map must preserve Tax Year 2026–27 / Section 156 under the 2025 Act.');
if (!sources.includes('incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/income-tax-returns') || !sources.includes('incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/income-and-tax-estimator-um')) throw new Error('Official Income Tax Department source links are missing.');
console.log('India tax terminology audit PASS: AY 2026-27 maps to 1961 Act Section 87A; Tax Year 2026-27 maps to 2025 Act Section 156.');
