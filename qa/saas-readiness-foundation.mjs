import fs from 'node:fs';
import assert from 'node:assert/strict';
const widget = fs.readFileSync('widget.js', 'utf8');
const runtime = fs.readFileSync('wa-calculator-runtime.js', 'utf8');
const shared = fs.readFileSync('functions/v1/_shared.js', 'utf8');
const calculatorDefinitions = fs.readFileSync('calculators.js', 'utf8');
const calculate = fs.readFileSync('functions/v1/calculate.js', 'utf8');
const models = fs.readFileSync('functions/v1/models.js', 'utf8');
const fx = fs.readFileSync('functions/v1/fx.js', 'utf8');
const tax = fs.readFileSync('functions/v1/india-tax.js', 'utf8');
const auth = fs.readFileSync('functions/v1/_auth.js', 'utf8');
const authConfig = fs.readFileSync('functions/v1/auth-config.js', 'utf8');
const scenarios = fs.readFileSync('functions/v1/scenarios.js', 'utf8');
const checkout = fs.readFileSync('functions/v1/billing/checkout.js', 'utf8');
const webhook = fs.readFileSync('functions/v1/billing/webhook.js', 'utf8');
const cancel = fs.readFileSync('functions/v1/billing/cancel.js', 'utf8');
const account = fs.readFileSync('account.js', 'utf8');
const premiumBuild = fs.readFileSync('scripts/phase4-premium-build.mjs', 'utf8');
const adLoader = fs.readFileSync('wa-ad-loader.js', 'utf8');
const migration = fs.readFileSync('migrations/0001_saas.sql', 'utf8');
for (const [name, source] of [['widget.js', widget], ['wa-calculator-runtime.js', runtime]]) {
  assert.match(source, /toLocaleString\(['"]en-IN['"]/ , name + ' must format numbers using Indian grouping');
  assert.match(source, /waScenarioUrl/, name + ' must build scenario links with input values');
  assert.match(source, /waRestoreScenario/, name + ' must restore scenario values from shared links');
  assert.match(source, /waGetSavedScenarios/, name + ' must persist scenarios locally');
  assert.match(source, /waSyncSavedScenarios/, name + ' must support opt-in account sync');
  assert.match(source, /Download PDF/, name + ' must expose a direct PDF download action');
  assert.match(source, /compare-panel\[hidden\].*display:none!important/, name + ' must honor hidden state for compare and saved panels');
  assert.match(source, /waDownloadPdfReport/, name + ' must download a PDF report');
  assert.match(source, /waRunIndiaTax/, name + ' must expose the explicit Indian tax engine action');
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
assert.match(widget, /Estimate India new-regime tax/);
assert.match(auth, /auth\/v1\/user/);
assert.match(authConfig, /SUPABASE_ANON_KEY/);
assert.match(scenarios, /DELETE FROM saved_scenarios WHERE id = \? AND user_id = \?/);
assert.match(checkout, /RAZORPAY_PLAN_MONTHLY/);
assert.match(webhook, /crypto\.subtle\.sign/);
assert.match(premiumBuild, /wa-ad-loader\.js/);
assert.match(adLoader, /waSubscriptionCache/);
assert.match(adLoader, /adsbygoogle\.js/);
assert.doesNotMatch(premiumBuild.match(/const adsenseJs=.*;/)?.[0] || '', /localStorage/);
assert.match(cancel, /cancel_at_cycle_end/);
assert.ok(account.includes('/auth/v1/signup'));
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

const taxHarness = tax
  .replace(/^import \{ CORS_HEADERS, error, json \} from "\.\/\_shared\.js";\n/, 'const CORS_HEADERS = {}; const error = (code, message, status = 400, details) => new Response(JSON.stringify({error:{code,message,...(details?{details}:{})}}), {status, headers:{"Content-Type":"application/json"}}); const json = (data, status = 200) => new Response(JSON.stringify(data), {status, headers:{"Content-Type":"application/json"}});\n')
  .replaceAll('export async function onRequestOptions', 'async function onRequestOptions')
  .replaceAll('export async function onRequestPost', 'async function onRequestPost') + '\nexport { onRequestPost };';
const taxModule = await import('data:text/javascript;base64,' + Buffer.from(taxHarness).toString('base64'));
const taxAt12L = await taxModule.onRequestPost({ request: new Request('https://example.test/v1/india-tax', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({tax_year:'2026-27',regime:'new',taxable_income:1200000,rebate_eligible:true}) }) });
const tax12L = await taxAt12L.json();
assert.equal(taxAt12L.status, 200);
assert.equal(tax12L.results.find(x=>x.label==='Estimated total tax').value, 0, 'Section 87A rebate should reduce normal tax to zero at ₹12 lakh taxable income');
const taxAt125L = await taxModule.onRequestPost({ request: new Request('https://example.test/v1/india-tax', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({tax_year:'2026-27',regime:'new',taxable_income:1250000}) }) });
const tax125L = await taxAt125L.json();
assert.equal(tax125L.results.find(x=>x.label==='Estimated total tax').value, 52000, 'Marginal relief and cess should be applied at ₹12.5 lakh taxable income');
console.log('SaaS readiness foundation audit, calculation vectors and tax vectors passed.');

