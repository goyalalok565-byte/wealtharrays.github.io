const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const widget = fs.readFileSync(path.join(root, 'widget.js'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'wa-calculator-runtime.js'), 'utf8');
const sources = fs.readFileSync(path.join(root, 'docs/INDIA-TAX-YEAR-SOURCES.md'), 'utf8');

for (const [name, source] of [['widget source', widget], ['generated calculator runtime', runtime]]) {
  test(name + ' uses Section 156 for Tax Year 2026-27 only', () => {
    assert.ok(source.includes('Section 156 rebate eligibility (Tax Year 2026–27)'));
    assert.ok(source.includes('Estimate India new-regime tax (Tax Year 2026–27)'));
    assert.ok(!source.includes('Section 87A rebate eligibility'));
    assert.ok(!source.includes('FY 2026–27'));
  });
}

test('official tax-year source map distinguishes AY 2026-27 Section 87A from TY 2026-27 Section 156', () => {
  assert.ok(sources.includes('Assessment Year 2026–27 (income earned in FY 2025–26)'));
  assert.ok(sources.includes('Income-tax Act, 1961'));
  assert.ok(sources.includes('Section 87A'));
  assert.ok(sources.includes('Tax Year 2026–27 (period beginning 1 April 2026)'));
  assert.ok(sources.includes('Income-tax Act, 2025'));
  assert.ok(sources.includes('Section 156'));
  assert.ok(sources.includes('incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/income-tax-returns'));
  assert.ok(sources.includes('incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/income-and-tax-estimator-um'));
});
