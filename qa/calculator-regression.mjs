import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('calculators.js', 'utf8');
const context = { console };
vm.createContext(context);
vm.runInContext(`${source}\n;globalThis.__WA_TEST_CALCULATORS__ = CALCULATORS;`, context, { filename: 'calculators.js' });
const calculators = context.__WA_TEST_CALCULATORS__;

const expected = [
  'sip','compound-interest','mortgage','roi','simple-interest','retirement',
  'salary-conversion','profit-margin','fixed-deposit','recurring-deposit','lumpsum','cagr',
  'car-loan','personal-loan','debt-payoff','inflation','net-worth','overtime','freelance-rate','income-tax-scenario'
];

const assert = (condition, message) => { if (!condition) throw new Error(message); };
assert(Array.isArray(calculators), 'CALCULATORS must be an array');
assert(calculators.length === 20, `Expected 20 calculators, found ${calculators.length}`);
assert(JSON.stringify(calculators.map(c => c.id)) === JSON.stringify(expected), 'Calculator catalog/order changed unexpectedly');

for (const calc of calculators) {
  assert(calc.slug && calc.title && Array.isArray(calc.fields) && typeof calc.compute === 'function', `${calc.id}: malformed definition`);
  const ids = calc.fields.map(f => f.id);
  assert(new Set(ids).size === ids.length, `${calc.id}: duplicate field id`);
  const values = Object.fromEntries(calc.fields.map(f => [f.id, f.default]));
  let result;
  try { result = calc.compute(values); } catch (error) { throw new Error(`${calc.id}: default calculation threw: ${error.message}`); }
  assert(Array.isArray(result) && result.length > 0, `${calc.id}: no result rows`);
  for (const row of result) {
    assert(row && typeof row.label === 'string', `${calc.id}: invalid result label`);
    assert(typeof row.value === 'number' && Number.isFinite(row.value), `${calc.id}: non-finite result for ${row.label}`);
  }
}

const byId = Object.fromEntries(calculators.map(c => [c.id, c]));
const defaults = id => Object.fromEntries(byId[id].fields.map(f => [f.id, f.default]));
const compute = (id, patch) => byId[id].compute({ ...defaults(id), ...patch });
const first = (id, patch) => compute(id, patch)[0].value;

// Golden/invariant checks for the highest-risk financial formula families.
assert(Math.abs(first('simple-interest', { principal: 1000, rate: 10, years: 2 }) - 1200) < 1e-9, 'simple-interest golden check failed');
assert(Math.abs(first('compound-interest', { principal: 1000, rate: 10, years: 2, freq: '1' }) - 1210) < 1e-9, 'compound-interest golden check failed');
assert(Math.abs(first('mortgage', { principal: 100000, rate: 0, years: 10 }) - (100000 / 120)) < 1e-9, 'mortgage zero-rate check failed');
assert(Math.abs(first('roi', { cost: 1000, finalValue: 1500, years: 2 }) - 50) < 1e-9, 'ROI golden check failed');
assert(Math.abs(first('cagr', { initial: 1000, final: 1210, years: 2 }) - 10) < 1e-9, 'CAGR golden check failed');
assert(Math.abs(first('inflation', { amount: 1000, rate: 5, years: 10 }) - (1000 * Math.pow(1.05, 10))) < 1e-6, 'inflation golden check failed');
assert(first('sip', { monthly: 100, rate: 0, years: 10, inflation: 0 }) === 12000, 'SIP zero-return check failed');

// Monotonic sanity checks catch many accidental sign/unit regressions.
assert(first('sip', { monthly: 200, rate: 12, years: 10, inflation: 0 }) > first('sip', { monthly: 200, rate: 6, years: 10, inflation: 0 }), 'SIP rate monotonicity failed');
assert(first('compound-interest', { principal: 5000, rate: 8, years: 15, freq: '12' }) > first('compound-interest', { principal: 5000, rate: 8, years: 10, freq: '12' }), 'compound-interest term monotonicity failed');
assert(first('mortgage', { principal: 200000, rate: 7, years: 15 }) > first('mortgage', { principal: 100000, rate: 7, years: 15 }), 'mortgage principal monotonicity failed');

console.log('Calculator regression PASS — 20/20 definitions, default computations, golden checks, and monotonicity checks passed.');
