import fs from 'node:fs';
import assert from 'node:assert/strict';
const widget = fs.readFileSync('widget.js', 'utf8');
const runtime = fs.readFileSync('wa-calculator-runtime.js', 'utf8');
const shared = fs.readFileSync('functions/v1/_shared.js', 'utf8');
const calculate = fs.readFileSync('functions/v1/calculate.js', 'utf8');
const models = fs.readFileSync('functions/v1/models.js', 'utf8');
const fx = fs.readFileSync('functions/v1/fx.js', 'utf8');
const tax = fs.readFileSync('functions/v1/india-tax.js', 'utf8');
const migration = fs.readFileSync('migrations/0001_saas.sql', 'utf8');
for (const [name, source] of [['widget.js', widget], ['wa-calculator-runtime.js', runtime]]) {
  assert.match(source, /toLocaleString\(['"]en-IN['"]/ , name + ' must format numbers using Indian grouping');
  assert.match(source, /waScenarioUrl/, name + ' must build scenario links with input values');
  assert.match(source, /waRestoreScenario/, name + ' must restore scenario values from shared links');
  assert.match(source, /waGetSavedScenarios/, name + ' must persist scenarios locally');
  assert.match(source, /waDownloadPdfReport/, name + ' must download a PDF report');
  assert.match(source, /aria-invalid/, name + ' must expose field validation to assistive technology');
  assert.match(source, /Get live exchange rate/, name + ' must expose live FX retrieval');
  assert.match(source, /addEventListener\(['"]click['"],(?:function\(\)|recompute)/, name + ' must keep calculation behind the explicit button');
  assert.doesNotMatch(source, /if\(inputsComplete\(\)\)recompute\(\)/, name + ' must not auto-calculate during typing');
}
for (const model of ['sip','loan-emi','home-loan-emi','compound-interest','fixed-deposit','lumpsum','gst','cagr','inflation','simple-interest','currency-converter']) assert.ok(shared.includes('id: "'+model+'"'), 'API registry missing '+model);
assert.match(calculate, /export async function onRequestPost/);
assert.match(models, /export async function onRequestGet/);
assert.match(fx, /open\.er-api\.com/);
assert.match(tax, /2026-27-new-regime-v1/);
assert.match(migration, /CREATE TABLE IF NOT EXISTS saved_scenarios/);
assert.match(migration, /CREATE TABLE IF NOT EXISTS subscriptions/);

const sharedModule = await import('data:text/javascript;base64,' + Buffer.from(shared).toString('base64'));
const sip = sharedModule.calculate('sip', { monthly: 200, annualRate: 10, years: 15 });
assert.ok(Math.abs(sip.results[2].value - 83584.85) < 0.02, 'SIP API golden vector must match the documented example');
const gstExclusive = sharedModule.calculate('gst', { amount: 100000, rate: 18, mode: 'exclusive' });
assert.equal(gstExclusive.results[1].value, 18000, 'GST exclusive tax amount must be correct');
const gstInclusive = sharedModule.calculate('gst', { amount: 118000, rate: 18, mode: 'inclusive' });
assert.equal(gstInclusive.results[0].value, 100000, 'GST inclusive taxable base must be correct');
const zeroInterest = sharedModule.calculate('loan-emi', { principal: 120000, annualRate: 0, months: 12 });
assert.equal(zeroInterest.results[0].value, 10000, 'Zero-rate loan EMI must avoid divide-by-zero');
assert.throws(() => sharedModule.calculate('cagr', { startValue: 100, endValue: 110, years: 0 }), /years must be greater than zero/);
console.log('SaaS readiness foundation audit and API golden vectors passed.');

