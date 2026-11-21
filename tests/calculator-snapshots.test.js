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

function assertSnapshotEquivalent(actual, expected, message) {
  if (typeof actual === 'number' && typeof expected === 'number' &&
      Number.isFinite(actual) && Number.isFinite(expected)) {
    const difference = Math.abs(actual - expected);
    const scale = Math.max(Math.abs(actual), Math.abs(expected));
    const withinTolerance = difference <= Math.max(1e-9, 1e-12 * scale);
    assert.ok(withinTolerance, `${message}: numeric difference exceeds relative 1e-12 / absolute 1e-9 tolerance (actual=${actual}, expected=${expected})`);
    return;
  }
  if (Array.isArray(actual) || Array.isArray(expected)) {
    assert.ok(Array.isArray(actual) && Array.isArray(expected), message);
    assert.equal(actual.length, expected.length, message);
    for (let i = 0; i < actual.length; i++) {
      assertSnapshotEquivalent(actual[i], expected[i], `${message}[ ${i} ]`);
    }
    return;
  }
  if (actual !== null && expected !== null &&
      typeof actual === 'object' && typeof expected === 'object') {
    assert.deepEqual(Object.keys(actual).sort(), Object.keys(expected).sort(), message);
    for (const key of Object.keys(expected)) {
      assertSnapshotEquivalent(actual[key], expected[key], `${message}.${key}`);
    }
    return;
  }
  assert.deepEqual(actual, expected, message);
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
      assertSnapshotEquivalent(actual, expected.output, `${calculator.id}/${kind}: calculation output changed; review formula and references before updating snapshots`);
    }
  }
});

test('snapshot numeric tolerance accepts runtime rounding but rejects material drift', () => {
  assertSnapshotEquivalent(1 + 1e-13, 1, 'sub-tolerance rounding');
  assertSnapshotEquivalent(-0, 0, 'signed zero is equivalent');
  assertSnapshotEquivalent(5e-10, 0, 'absolute tolerance near zero');
  assert.throws(
    () => assertSnapshotEquivalent(1 + 1e-6, 1, 'material drift'),
    /numeric difference exceeds relative 1e-12 \/ absolute 1e-9 tolerance/
  );
  assert.throws(
    () => assertSnapshotEquivalent('1.00', 1, 'type/format drift'),
    assert.AssertionError
  );
  assert.throws(
    () => assertSnapshotEquivalent(null, 0, 'null drift'),
    assert.AssertionError
  );
});
