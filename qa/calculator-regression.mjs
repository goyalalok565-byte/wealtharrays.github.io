import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('calculators.js', 'utf8');
const context = { console };
vm.createContext(context);
vm.runInContext(`${source}\n;globalThis.__WA_TEST_CALCULATORS__ = CALCULATORS;`, context, { filename: 'calculators.js' });
const calculators = context.__WA_TEST_CALCULATORS__;

const expectedSlugs = [
  'sip-calculator','compound-interest-calculator','mortgage-emi-calculator','roi-calculator','simple-interest-calculator',
  'retirement-calculator','salary-to-hourly-calculator','profit-margin-calculator','fixed-deposit-calculator','recurring-deposit-calculator',
  'lumpsum-calculator','cagr-calculator','car-loan-calculator','personal-loan-calculator','debt-payoff-calculator','inflation-calculator',
  'net-worth-calculator','overtime-pay-calculator','freelance-rate-calculator','income-tax-scenario-calculator'
];

const assert = (condition, message) => { if (!condition) throw new Error(message); };
assert(Array.isArray(calculators), 'CALCULATORS must be an array');
assert(calculators.length === 20, `Expected 20 calculators, found ${calculators.length}`);
const actualSlugs = calculators.map(c => c.slug);
for (const slug of expectedSlugs) assert(actualSlugs.includes(slug), `Required calculator slug missing: ${slug}`);
assert(new Set(actualSlugs).size === actualSlugs.length, 'Calculator slugs must be unique');

for (const calc of calculators) {
  assert(calc.id && calc.slug && calc.title && Array.isArray(calc.fields) && typeof calc.compute === 'function', `${calc.slug}: malformed definition`);
  const ids = calc.fields.map(f => f.id);
  assert(new Set(ids).size === ids.length, `${calc.slug}: duplicate field id`);
  const values = Object.fromEntries(calc.fields.map(f => [f.id, f.default]));
  let result;
  try { result = calc.compute(values); } catch (error) { throw new Error(`${calc.slug}: default calculation threw: ${error.message}`); }
  assert(Array.isArray(result) && result.length > 0, `${calc.slug}: no result rows`);
  for (const row of result) {
    assert(row && typeof row.label === 'string', `${calc.slug}: invalid result label`);
    assert(typeof row.value === 'number' && Number.isFinite(row.value), `${calc.slug}: non-finite result for ${row.label}`);
  }

  // Boundary smoke: zero numeric inputs must not create NaN/Infinity.
  const zeroed = Object.fromEntries(calc.fields.map(f => [f.id, typeof f.default === 'number' ? 0 : f.default]));
  try { result = calc.compute(zeroed); } catch (error) { throw new Error(`${calc.slug}: zero-boundary calculation threw: ${error.message}`); }
  for (const row of result) assert(typeof row.value === 'number' && Number.isFinite(row.value), `${calc.slug}: zero-boundary non-finite result for ${row.label}`);
}

const bySlug = Object.fromEntries(calculators.map(c => [c.slug, c]));
const valuesFor = (slug, overrides = {}) => ({ ...Object.fromEntries(bySlug[slug].fields.map(f => [f.id, f.default])), ...overrides });
const first = (slug, overrides) => bySlug[slug].compute(valuesFor(slug, overrides))[0].value;

// Stable golden checks where the field contract is known.
assert(Math.abs(first('simple-interest-calculator', { principal: 1000, rate: 10, years: 2 }) - 1200) < 1e-9, 'simple-interest golden check failed');
assert(Math.abs(first('compound-interest-calculator', { principal: 1000, rate: 10, years: 2, freq: '1' }) - 1210) < 1e-9, 'compound-interest golden check failed');
assert(Math.abs(first('mortgage-emi-calculator', { principal: 100000, rate: 0, years: 10 }) - (100000 / 120)) < 1e-9, 'mortgage zero-rate check failed');

console.log('Calculator regression PASS — 20/20 calculators, defaults, zero-boundaries, and golden checks passed.');
