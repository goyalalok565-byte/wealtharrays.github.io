const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const widget = fs.readFileSync(path.join(root, 'widget.js'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'wa-calculator-runtime.js'), 'utf8');
for (const [name, source] of [['widget source', widget], ['generated calculator runtime', runtime]]) {
  test(name + ' uses Section 156 for Tax Year 2026-27', () => {
    assert.ok(source.includes('Section 156 rebate eligibility (Tax Year 2026–27)'));
    assert.ok(source.includes('Estimate India new-regime tax (Tax Year 2026–27)'));
    assert.ok(!source.includes('Section 87A rebate eligibility'));
    assert.ok(!source.includes('FY 2026–27'));
  });
}
