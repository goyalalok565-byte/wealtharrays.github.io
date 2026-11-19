import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePerformanceRow } from './performance-thresholds.mjs';
test('performance gate accepts exact thresholds', () => assert.deepEqual(evaluatePerformanceRow({performance:90,cls:0.1,tbt:200,lcp:2500}), {gate:'PASS',violations:[]}));
test('performance gate rejects all four breaches and missing values', () => {
 const result=evaluatePerformanceRow({performance:89,cls:0.101,tbt:201,lcp:2501});
 assert.equal(result.gate,'FAIL'); assert.equal(result.violations.length,4);
 assert.equal(evaluatePerformanceRow({performance:100,cls:null,tbt:null,lcp:null}).gate,'FAIL');
 console.log('EXPECTED_FAILING_CASE_OBSERVED: all four Lighthouse budgets were breached; gate returned FAIL.');
});
