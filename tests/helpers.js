const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const cache = new Map();
function calculator(id) {
  if (cache.has(id)) return cache.get(id);
  const file = path.join(__dirname, '..', 'calculator-definitions', `${id}.js`);
  assert.ok(fs.existsSync(file), `missing calculator definition ${file}`);
  const context = { window: { CALCULATORS: [] } };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
  const item = context.window.CALCULATORS.find(x => x.id === id);
  assert.ok(item, `missing calculator ${id}`);
  cache.set(id, item);
  return item;
}
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
