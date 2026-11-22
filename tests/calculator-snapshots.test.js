import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const { CALCULATORS } = require('../calculators.js');
const fixture = JSON.parse(fs.readFileSync(new URL('./snapshots.json', import.meta.url), 'utf8'));

function fixtureValue(field, kind) {
  if (kind === 'default') return field.default !== undefined ? field.default : field.type === 'select' ? (field.options?.[0]?.value ?? '') : typeof field.min === 'number' ? (field.min > 0 ? field.min : 1) : 1;
  if (kind === 'zero') return field.type === 'select' ? (field.default ?? field.options?.[0]?.value ?? '') : 0;
  if (kind === 'blank') return '';
  if (kind === 'large') return field.type === 'select' ? (field.default ?? field.options?.[0]?.value ?? '') : typeof field.max === 'number' ? field.max : typeof field.default === 'number' ? Math.max(Math.abs(field.default) * 1e6, 1e6) : typeof field.min === 'number' ? Math.max(field.min * 1e6, 1e6) : 1e6;
  return field.type === 'select' ? '__INVALID_OPTION__' : typeof field.min === 'number' ? field.min - 1 : typeof field.max === 'number' ? field.max + 1 : '__INVALID__';
}

function normalize(result) {
  if (!Array.isArray(result)) return { type: typeof result, value: String(result) };
  return result.map(row => ({
    label: row?.label ?? null,
    value: Number.isFinite(row?.value) ? row.value : String(row?.value),
    format: row?.format ?? null,
    emphasis: row?.emphasis ?? null
  }));
}

test('golden snapshots cover all 55 canonical calculators × five scenarios', () => {
  assert.equal(CALCULATORS.length, 55, 'Review the catalogue count before changing the golden fixture scope');
  assert.equal(fixture.snapshots.length, 275);
  assert.deepEqual(new Set(fixture.snapshots.map(s => s.calculator)).size, 55);
  for (const calculator of CALCULATORS) {
    for (const kind of ['default', 'zero', 'blank', 'large', 'invalid']) {
      const expected = fixture.snapshots.find(s => s.calculator === calculator.id && s.case === kind);
      assert.ok(expected, `Missing snapshot: ${calculator.id}/${kind}`);
      const inputs = Object.fromEntries(calculator.fields.map(field => [field.id, fixtureValue(field, kind)]));
      assert.deepEqual(inputs, expected.inputs, `${calculator.id}/${kind}: fixture input policy changed`);
      let actual;
      try { actual = normalize(calculator.compute(inputs)); }
      catch (error) { actual = { error: error?.name || 'Error', message: String(error?.message || error) }; }
      assert.deepEqual(actual, expected.output, `${calculator.id}/${kind}: calculation output changed; review formula and references before updating snapshots`);
    }
  }
});
