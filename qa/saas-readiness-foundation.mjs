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
console.log('SaaS readiness foundation audit passed.');
