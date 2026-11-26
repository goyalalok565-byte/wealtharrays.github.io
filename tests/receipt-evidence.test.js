import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { buildReceiptEvidence, canonicalReceiptPayload, receiptDigest, RECEIPT_CASE_IDS } from '../scripts/receipt-evidence.mjs';

const require = createRequire(import.meta.url);
const { CALCULATORS } = require('../calculators.js');

test('receipt evidence runs independent vectors for the first five calculator models', () => {
  const evidence = buildReceiptEvidence(CALCULATORS, 'test-build');
  assert.deepEqual(Object.keys(evidence.models).sort(), ['compound-interest', 'mortgage', 'rent-vs-buy', 'sip', 'swp']);
  for (const [id, model] of Object.entries(evidence.models)) {
    assert.equal(model.passed, true, id);
    assert.equal(model.independent_case_count, 1, id);
    assert.equal(model.case_ids[0], RECEIPT_CASE_IDS[id]);
  }
});

test('receipt evidence fails closed when an independent reference no longer matches', () => {
  const broken = CALCULATORS.map(calc => calc.id === 'sip'
    ? { ...calc, compute: () => [{ value: 0 }] }
    : calc);
  assert.throws(() => buildReceiptEvidence(broken, 'test-build'), /Independent receipt vector failed for sip/);
});

test('receipt canonical JSON sorts object keys and preserves array order', () => {
  assert.equal(canonicalReceiptPayload({ z: 1, a: { y: 2, x: 3 } }), '{"a":{"x":3,"y":2},"z":1}');
  assert.equal(canonicalReceiptPayload([3, 1]), '[3,1]');
});

test('receipt SHA-256 is deterministic and changes when calculation facts change', () => {
  const a = { model_id: 'sip', model_version: '1.0.0', inputs: { monthly: 200 }, outputs: [100] };
  const b = { outputs: [100], inputs: { monthly: 200 }, model_version: '1.0.0', model_id: 'sip' };
  assert.equal(receiptDigest(a), receiptDigest(b));
  assert.notEqual(receiptDigest(a), receiptDigest({ ...a, outputs: [101] }));
  assert.equal(receiptDigest(a).length, 64);
  assert.throws(() => canonicalReceiptPayload({ amount: Infinity }), /finite/);
});
