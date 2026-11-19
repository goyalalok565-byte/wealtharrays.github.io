import fs from 'node:fs';
import assert from 'node:assert/strict';
const widget=fs.readFileSync('widget.js','utf8');
const runtime=fs.readFileSync('wa-calculator-runtime.js','utf8');
const api=fs.readFileSync('functions/v1/india-tax.js','utf8');
const docs=fs.readFileSync('SAAS_SETUP.md','utf8');
for(const [name,source] of [['widget.js',widget],['wa-calculator-runtime.js',runtime]]){
 assert.match(source,/Section 156 rebate eligibility/,name+' must use Section 156 for Tax Year 2026-27');
 assert.doesNotMatch(source,/Section 87A rebate eligibility/,name+' must not label Tax Year 2026-27 as Section 87A');
}
assert.match(widget,/AY 2026–27[\s\S]{0,180}Section 87A/,'Old Act wording must be scoped to AY 2026-27');
assert.match(api,/Section 156 rebate/); assert.match(api,/marginal relief/);
assert.match(api,/265620\.pdf/);
assert.match(api,/tax_year_guidance_url/);
assert.match(api,/old_act_ay_guidance_url/);
assert.match(docs,/Section 87A wording belongs only to that old-Act assessment year/);
console.log('Tax-year terminology PASS: FY/Tax Year 2026-27 uses Section 156; Section 87A is restricted to AY 2026-27 under the 1961 Act.');
