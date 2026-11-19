const assert = require('node:assert/strict');
const { CALCULATORS } = require('../calculators.js');
function calculator(id) { const item = CALCULATORS.find(x => x.id === id); assert.ok(item, `missing calculator ${id}`); return item; }
function values(id, input) { return calculator(id).compute(input).map(x => Number(x.value)); }
function close(actual, expected, label, tolerance = 1e-4) {
  assert.ok(Number.isFinite(actual), `${label}: output must be finite, got ${actual}`);
  assert.ok(Number.isFinite(expected), `${label}: reference must be finite, got ${expected}`);
  const delta = Math.abs(actual - expected);
  const allowed = Math.max(0.01, Math.abs(expected) * tolerance);
  assert.ok(delta <= allowed, `${label}: actual=${actual}; independent reference=${expected}; delta=${delta}; allowed=${allowed}`);
}
function safeOutputs(id, input) { const out = values(id, input); for (const n of out) assert.ok(Number.isFinite(n), `${id} emitted non-finite output ${n}`); return out; }
module.exports = { calculator, values, close, safeOutputs };
