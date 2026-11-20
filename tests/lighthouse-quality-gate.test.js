const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateSummary, THRESHOLDS } = require('../qa/lighthouse-quality-gate.mjs');
const row = (route, overrides = {}) => ({ route, performance: 95, accessibility: 100, bestPractices: 100, seo: 100, clsValue: 0.02, tbtMs: 100, lcpMs: 1800, ...overrides });
test('accepts seven routes that meet all mobile release thresholds', () => {
  assert.deepEqual(evaluateSummary({ rows: Array.from({ length: 7 }, (_, i) => row('/route-' + i)) }), []);
});
test('fails when performance, CLS, TBT or LCP exceed strict thresholds', () => {
  const failures = evaluateSummary({ rows: [row('/performance', { performance: THRESHOLDS.performance - 1 }), row('/cls', { clsValue: THRESHOLDS.cls + 0.01 }), row('/tbt', { tbtMs: THRESHOLDS.tbtMs + 1 }), row('/lcp', { lcpMs: THRESHOLDS.lcpMs + 1 }), row('/missing', { tbtMs: null }), row('/ok-1'), row('/ok-2')] });
  for (const expected of ['/performance: performance', '/cls: CLS', '/tbt: TBT', '/lcp: LCP', '/missing: TBT']) assert.ok(failures.some(message => message.includes(expected)), 'expected failure: ' + expected);
});
test('fails missing routes and accessibility regressions', () => {
  const failures = evaluateSummary({ rows: [row('/home', { accessibility: 94 })] });
  assert.ok(failures.some(message => message.includes('Expected seven Lighthouse routes')));
  assert.ok(failures.some(message => message.includes('/home: accessibility')));
});
