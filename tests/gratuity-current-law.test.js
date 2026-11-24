import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { CALCULATORS } = require('../calculators.js');
const gratuity = CALCULATORS.find(item => item.id === 'gratuity');

test('gratuity page explains current Social Security Code scope without claiming eligibility', () => {
  assert.ok(gratuity);
  assert.match(gratuity.desc, /general five-year threshold/i);
  assert.match(gratuity.desc, /fixed-term and statutory exceptions are not assessed/i);
  assert.match(gratuity.article.formula, /Code on Social Security, 2020 took effect on 21 November 2025/);
  assert.match(gratuity.article.formula, /does not assess fixed-term eligibility/);
  assert.match(gratuity.article.faqs[0].q, /determine gratuity eligibility/i);
  assert.match(gratuity.article.faqs[0].a, /does not assess fixed-term employment provisions/i);
  assert.match(gratuity.fields.find(field => field.id === 'salary').label, /wage base/i);
});

test('gratuity output labels describe the general five-year illustration, not legal eligibility', () => {
  const belowGeneralThreshold = gratuity.compute({ salary: 50000, years: 4 });
  assert.equal(belowGeneralThreshold[0].value, 0);
  assert.match(belowGeneralThreshold[0].label, /exceptions not assessed/i);
  assert.match(belowGeneralThreshold[1].label, /not a legal eligibility decision/i);
  const atGeneralThreshold = gratuity.compute({ salary: 50000, years: 5 });
  assert.equal(atGeneralThreshold[0].value, 50000 * 15 / 26 * 5);
});
