import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('calculators.js', 'utf8');
const context = { console };
vm.createContext(context);
vm.runInContext(`${source}\n;globalThis.__WA_TEST_CALCULATORS__ = CALCULATORS;`, context, { filename: 'calculators.js' });
const calculators = context.__WA_TEST_CALCULATORS__;

const assert = (condition, message) => { if (!condition) throw new Error(message); };
assert(Array.isArray(calculators), 'CALCULATORS must be an array');
assert(calculators.length === 20, `Expected 20 calculators, found ${calculators.length}`);
const actualSlugs = calculators.map(c => c.slug);
assert(actualSlugs.every(Boolean), 'Every calculator must have a slug');
assert(new Set(actualSlugs).size === actualSlugs.length, 'Calculator slugs must be unique');

function safeInput(field) {
  if (field.default !== undefined) return field.default;
  if (field.type === 'select') return field.options?.[0]?.value ?? '';
  if (typeof field.min === 'number') return field.min > 0 ? field.min : 1;
  return 1;
}

for (const calc of calculators) {
  assert(calc.id && calc.slug && calc.title && Array.isArray(calc.fields) && typeof calc.compute === 'function', `${calc.slug}: malformed definition`);
  const ids = calc.fields.map(f => f.id);
  assert(new Set(ids).size === ids.length, `${calc.slug}: duplicate field id`);
  const safeDefaults = Object.fromEntries(calc.fields.map(f => [f.id, safeInput(f)]));
  let result;
  try { result = calc.compute(safeDefaults); } catch (error) { throw new Error(`${calc.slug}: valid-input calculation threw: ${error.message}; inputs=${JSON.stringify(safeDefaults)}`); }
  assert(Array.isArray(result) && result.length > 0, `${calc.slug}: no result rows`);
  for (const row of result) {
    assert(row && typeof row.label === 'string', `${calc.slug}: invalid result label`);
    assert(typeof row.value === 'number' && Number.isFinite(row.value), `${calc.slug}: non-finite valid-input result for ${row.label}; inputs=${JSON.stringify(safeDefaults)}`);
  }

  const zeroed = Object.fromEntries(calc.fields.map(f => [f.id, typeof f.default === 'number' ? 0 : (f.type === 'select' ? f.default ?? f.options?.[0]?.value ?? '' : 0)]));
  try { result = calc.compute(zeroed); } catch (error) { throw new Error(`${calc.slug}: zero-boundary calculation threw: ${error.message}; inputs=${JSON.stringify(zeroed)}`); }
  for (const row of result) assert(typeof row.value === 'number' && Number.isFinite(row.value), `${calc.slug}: zero-boundary non-finite result for ${row.label}; inputs=${JSON.stringify(zeroed)}`);
}

console.log('Calculator regression PASS — 20/20 calculators, unique schemas, valid-input calculations, zero-boundaries, and finite-output checks passed.');
