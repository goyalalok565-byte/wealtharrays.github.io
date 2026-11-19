import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = process.cwd();
const definitionsDir = path.join(root, 'calculator-definitions');
const snapshotFile = path.join(root, 'tests', 'snapshots.json');
const modes = ['default', 'zero', 'blank', 'large'];

function normalize(value) {
  if (value === undefined) return { __type: 'undefined' };
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return { __number: 'NaN' };
    if (value === Infinity) return { __number: 'Infinity' };
    if (value === -Infinity) return { __number: '-Infinity' };
    const rounded = Number(value.toPrecision(14));
    return Object.is(rounded, -0) ? 0 : rounded;
  }
  if (Array.isArray(value)) return value.map(normalize);
  if (typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, normalize(value[key])]));
  }
  return { __type: typeof value, value: String(value) };
}

function valueFor(field, mode) {
  if (mode === 'blank') return '';
  if (field.type === 'select') {
    const options = Array.isArray(field.options) ? field.options : [];
    if (mode === 'large') return options.length ? options[options.length - 1].value : (field.default ?? '');
    return field.default ?? options[0]?.value ?? '';
  }
  if (field.type === 'number') {
    if (mode === 'zero') return 0;
    if (mode === 'large') {
      const fallback = Math.max(1_000_000, Math.abs(Number(field.default) || 0) * 1_000, Number(field.min) || 0);
      return Number.isFinite(Number(field.max)) ? Math.max(Number(field.min) || 0, Number(field.max)) : fallback;
    }
    if (field.default !== undefined) return field.default;
    return Number.isFinite(Number(field.min)) ? Number(field.min) : 1;
  }
  if (mode === 'zero') return false;
  if (mode === 'large') return field.default ?? '';
  return field.default ?? '';
}

function loadDefinitions() {
  if (!fs.existsSync(definitionsDir)) throw new Error('calculator-definitions/ is missing; run the canonical build first.');
  const files = fs.readdirSync(definitionsDir).filter(name => name.endsWith('.js')).sort();
  const context = { window: { CALCULATORS: [] }, console };
  vm.createContext(context);
  for (const file of files) {
    const full = path.join(definitionsDir, file);
    vm.runInContext(fs.readFileSync(full, 'utf8'), context, { filename: file, timeout: 5_000 });
  }
  const calculators = context.window.CALCULATORS;
  if (!Array.isArray(calculators) || !calculators.length) throw new Error('No calculator definitions were loaded.');
  const ids = calculators.map(calc => calc.id);
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate calculator IDs detected in split definitions.');
  return calculators;
}

function createSnapshot() {
  const calculators = loadDefinitions().map(calc => {
    if (typeof calc.compute !== 'function') throw new Error(`Calculator ${calc.id} has no compute() function.`);
    const fields = Array.isArray(calc.fields) ? calc.fields : [];
    const cases = {};
    for (const mode of modes) {
      const inputs = Object.fromEntries(fields.map(field => [field.id, valueFor(field, mode)]));
      let output;
      try {
        output = normalize(calc.compute(inputs));
      } catch (error) {
        output = { __error: `${error?.name || 'Error'}: ${error?.message || String(error)}` };
      }
      cases[mode] = { inputs: normalize(inputs), output };
    }
    return { id: calc.id, slug: calc.slug, title: calc.title, cases };
  }).sort((a, b) => a.id.localeCompare(b.id));
  return { schemaVersion: 1, calculatorCount: calculators.length, caseNames: modes, calculators };
}

const actual = createSnapshot();
if (process.argv.includes('--write')) {
  fs.mkdirSync(path.dirname(snapshotFile), { recursive: true });
  fs.writeFileSync(snapshotFile, JSON.stringify(actual, null, 2) + '\n');
  console.log(`WROTE ${snapshotFile}: ${actual.calculatorCount} calculators × ${modes.length} input cases.`);
} else {
  if (!fs.existsSync(snapshotFile)) throw new Error(`Snapshot baseline missing: ${snapshotFile}. Generate it once with --write before runtime refactoring.`);
  const expected = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
  try {
    assert.deepStrictEqual(actual, expected);
  } catch (error) {
    console.error('Calculator snapshot mismatch. Runtime/formula changes must be reviewed and the baseline must not be auto-updated.');
    throw error;
  }
  console.log(`SNAPSHOT PASS: ${actual.calculatorCount} calculators × ${modes.length} input cases = ${actual.calculatorCount * modes.length} stable outputs.`);
}
