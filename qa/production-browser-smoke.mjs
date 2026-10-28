import { chromium } from 'playwright';
import fs from 'node:fs';
import vm from 'node:vm';
const calcContext={window:{},console};vm.createContext(calcContext);vm.runInContext(fs.readFileSync('calculators.js','utf8')+'\n;globalThis.__WA_TEST_CALCULATORS__=CALCULATORS;',calcContext);
const allCalculators=calcContext.__WA_TEST_CALCULATORS__;
if(!Array.isArray(allCalculators)||allCalculators.length!==47)throw new Error('Expected 47 calculator definitions, found '+(allCalculators?.length??'none'));

const baseUrl = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 375, height: 844 }, deviceScaleFactor: 1, acceptDownloads: true });
await context.addInitScript(() => { try { Object.defineProperty(navigator, 'share', { configurable: true, value: async payload => { window.__waSharePayload = payload; } }); } catch {} });
const page = await context.newPage();
const errors = [];
const failedResponses = [];
const expectedCspWarning = text => /^\[Report Only\]/i.test(text) || /Refused to execute inline script because it violates the following Content Security Policy directive/i.test(text);
page.on('pageerror', error => errors.push(`pageerror: ${error}`));
page.on('console', message => { if (message.type() === 'error' && !expectedCspWarning(message.text()) && !/googlesyndication|doubleclick|fonts\\.(googleapis|gstatic)|fundingchoices|ERR_BLOCKED_BY_CLIENT/i.test(message.text())) errors.push(`console: ${message.text()}`); });
page.on('response', response => { if (response.status() >= 400 && new URL(response.url()).origin === new URL(baseUrl).origin) failedResponses.push(`${response.status()} ${response.url()}`); });

async function diagnostics(label) {
  const data = await page.evaluate(() => {
    const widget = document.querySelector('#calc-widget');
    const scripts = [...document.scripts].map(s => s.src || '[inline]');
    const resources = performance.getEntriesByType('resource').map(r => ({ name: r.name, duration: Math.round(r.duration) }));
    const extra = resources.filter(r => r.name.includes('extra-calculator') || r.name.includes('calculator'));
    const sw = navigator.serviceWorker?.controller?.scriptURL || null;
    return { url: location.href, title: document.title, scripts, calculatorResources: extra, serviceWorker: sw, widget: widget ? { htmlLength: widget.innerHTML.length, className: widget.className, display: getComputedStyle(widget).display, visibility: getComputedStyle(widget).visibility, opacity: getComputedStyle(widget).opacity, rect: widget.getBoundingClientRect().toJSON(), html: widget.innerHTML.slice(0, 1200) } : null, bodyText: document.body.innerText.slice(0, 800) };
  });
  console.error(`CALCULATOR_DIAGNOSTICS ${label}: ${JSON.stringify(data)}`);
  if (failedResponses.length) console.error(`FAILED_RESPONSES ${label}: ${failedResponses.join(' | ')}`);
  if (errors.length) console.error(`BROWSER_ERRORS ${label}: ${errors.join(' | ')}`);
}

async function assertCalculator(path, label, phase2 = false) {
  errors.length = 0;
  failedResponses.length = 0;
  await page.goto(`${baseUrl}/${path}`, { waitUntil: 'networkidle' });
  try { await page.locator('#calc-widget').waitFor({ state: 'visible', timeout: 10000 }); }
  catch (error) { await diagnostics(label); throw new Error(`${label} failed to render at ${page.url()}: ${error.message}`); }
  if ((await page.locator('h1').count()) !== 1) throw new Error(`${label} must have exactly one H1`);
  if (!(await page.locator('#calc-widget input, #calc-widget select').count())) throw new Error(`${label} controls did not render`);
  if (phase2) {
    try { await page.locator('[data-wa-phase2], [data-wa-retirement-intelligence]').first().waitFor({ state: 'attached', timeout: 5000 }); }
    catch (error) { await diagnostics(label); throw new Error(`${label} Phase 2 decision-intelligence panels did not render within 5s: ${error.message}`); }
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
  if (overflow) throw new Error(`${label} has horizontal overflow at 390px viewport`);
}

try {
  await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
  const stylesheet = await page.locator('link[rel="stylesheet"][href*="styles.css"]').count();
  if (!stylesheet) throw new Error('Homepage stylesheet link is missing');
  const bodyDisplay = await page.locator('body').evaluate(el => getComputedStyle(el).display);
  if (bodyDisplay === 'inline') throw new Error('Homepage body is rendering with inline/default styling; CSS may be missing');
  if ((await page.locator('h1').count()) !== 1) throw new Error('Homepage must have exactly one H1');
  const retiredLinks = await page.locator('a[href*="real-return"]').count();
  if (retiredLinks) throw new Error('Homepage still exposes a retired real-return calculator link');

  for (const calc of allCalculators) {
    const label = calc.title + ' (' + calc.slug + ')';
    await assertCalculator(calc.slug + '/', label);
    const calculateButton = page.locator('#calc-widget button[id$="-calculate"]');
    const firstInput = page.locator('#calc-widget input[data-field]').first();
    await firstInput.fill('');
    await calculateButton.click();
    await page.locator('#calc-widget .wa-result-empty').waitFor({ state: 'visible', timeout: 3000 });
    if (!(await page.locator('#calc-widget input[aria-invalid="true"], #calc-widget select[aria-invalid="true"]').count())) throw new Error(label + ' must mark invalid fields when Calculate is clicked with empty inputs');
    for (const field of calc.fields) {
      const control = page.locator('#calc-widget [data-field="' + field.id + '"]');
      if (field.type === 'select') {
        const options = field.options || [];
        const currentValue = await control.inputValue();
        const candidate = field.default === undefined || field.default === null ? currentValue : String(field.default);
        const value = options.some(option => String(option.value) === candidate) ? candidate : String(options[0]?.value ?? '');
        if (value) await control.selectOption(value);
      } else {
        let value = field.default;
        if (value === undefined || value === null || value === '') value = await control.inputValue();
        if (value === undefined || value === null || value === '') value = field.min !== undefined && field.min > 0 ? field.min : 1;
        value = Number(value);
        if (field.min !== undefined && value < field.min) value = field.min;
        if (field.max !== undefined && value > field.max) value = field.max;
        await control.fill(String(value));
      }
    }
    if (await page.locator('#calc-widget .calc-result-row').count()) throw new Error(label + ' auto-calculated while the user was editing inputs');
    await calculateButton.click();
    await page.locator('#calc-widget .calc-result-row').first().waitFor({ state: 'visible', timeout: 5000 });
    const values = await page.locator('#calc-widget .calc-result-value').allTextContents();
    if (!values.length || values.some(value => /NaN|Infinity|undefined/i.test(value))) throw new Error(label + ' produced an invalid result: ' + values.join(' | '));
    await page.locator('#calc-widget button[id$="-compare"]').click();
    const comparePanel = page.locator('#calc-widget .compare-panel');
    await comparePanel.waitFor({ state: 'visible', timeout: 3000 });
    if (!(await comparePanel.isVisible())) throw new Error(label + ' Compare button did not open a visible comparison panel');
    if (failedResponses.length) throw new Error(label + ' failed same-origin requests: ' + failedResponses.join(' | '));
    if (errors.length) throw new Error(label + ' browser errors: ' + errors.join(' | '));
  }

  await assertCalculator('sip-calculator/', 'SIP calculator scenario tools');
  // Calculator pages intentionally start with blank inputs; fill a known scenario explicitly.
  for (const [field, expected] of [['monthly','200'],['rate','10'],['years','15'],['inflation','6']]) {
    await page.locator('#calc-widget input[data-field="' + field + '"]').fill(expected);
  }
  if (await page.locator('#calc-widget .calc-result-row').count()) throw new Error('SIP must not calculate automatically while filling a scenario');
  await page.locator('#calc-widget button[id$="-calculate"]').click();
  await page.locator('#calc-widget .calc-result-row').first().waitFor({ state: 'visible', timeout: 5000 });
  await page.locator('#calc-widget button[id$="-share"]').click();
  const sharePayload = await page.evaluate(() => window.__waSharePayload || null);
  if (!sharePayload?.url) throw new Error('Share scenario did not produce a share URL');
  const shareUrl = new URL(sharePayload.url);
  if (shareUrl.searchParams.get('wa_scenario') !== '1' || shareUrl.searchParams.get('wa_monthly') !== '200' || shareUrl.searchParams.get('wa_rate') !== '10' || shareUrl.searchParams.get('wa_years') !== '15' || shareUrl.searchParams.get('wa_inflation') !== '6') throw new Error('Share scenario URL did not preserve all SIP inputs');
  await page.goto(sharePayload.url, { waitUntil: 'networkidle' });
  for (const [field, expected] of [['monthly','200'],['rate','10'],['years','15'],['inflation','6']]) {
    const actual = await page.locator('#calc-widget input[data-field="' + field + '"]').inputValue();
    if (actual !== expected) throw new Error('Shared scenario did not restore ' + field + ': ' + actual);
  }
  if (await page.locator('#calc-widget .calc-result-row').count()) throw new Error('Shared scenario should restore inputs without auto-calculating');
  await page.locator('#calc-widget button[id$="-calculate"]').click();
  await page.locator('#calc-widget .calc-result-row').first().waitFor({ state: 'visible', timeout: 5000 });
  await page.locator('#calc-widget button[id$="-saved"]').click();
  await page.locator('#calc-widget button[id$="-save-current"]').click();
  await page.locator('#calc-widget .wa-saved-item').first().waitFor({ state: 'visible', timeout: 3000 });
  await page.locator('#calc-widget .wa-saved-item button[data-wa-load]').first().click();
  if (await page.locator('#calc-widget .calc-result-row').count()) throw new Error('Loading a saved scenario must require a new Calculate click');
  await page.locator('#calc-widget button[id$="-calculate"]').click();
  await page.locator('#calc-widget .calc-result-row').first().waitFor({ state: 'visible', timeout: 5000 });
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#calc-widget button[id$="-export"]').click();
  const pdfDownload = await downloadPromise;
  if (!pdfDownload.suggestedFilename().endsWith('.pdf')) throw new Error('Export action did not download a PDF file');
  await page.locator('#calc-widget .wa-saved-item button[data-wa-delete]').first().click();
  if (new URL(baseUrl).hostname === 'wealtharrays.com') {
    const modelsResponse = await fetch(baseUrl + '/v1/models');
    if (!modelsResponse.ok) throw new Error('Production /v1/models endpoint returned ' + modelsResponse.status);
    const modelData = await modelsResponse.json();
    if (!modelData.models?.some(model => model.id === 'sip' && model.version === '1.0.0')) throw new Error('Production model registry is missing the versioned SIP model');
    const apiCalcResponse = await fetch(baseUrl + '/v1/calculate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'sip', model_version: '1.0.0', inputs: { monthly: 200, annualRate: 10, years: 15 } }) });
    if (!apiCalcResponse.ok) throw new Error('Production /v1/calculate returned ' + apiCalcResponse.status);
    const apiCalc = await apiCalcResponse.json();
    const apiFuture = apiCalc.results?.find(result => result.label === 'Estimated future value')?.value;
    if (!Number.isFinite(apiFuture) || Math.abs(apiFuture - 83584.85) > 0.02) throw new Error('Production SIP API golden vector mismatch: ' + apiFuture);
    const taxResponse = await fetch(baseUrl + '/v1/india-tax', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tax_year: '2026-27', regime: 'new', taxable_income: 1200000, rebate_eligible: true }) });
    if (!taxResponse.ok) throw new Error('Production /v1/india-tax returned ' + taxResponse.status);
    const taxData = await taxResponse.json();
    if (taxData.results?.find(result => result.label === 'Estimated total tax')?.value !== 0) throw new Error('Production India tax rebate vector mismatch at ₹12 lakh');
    const fxResponse = await fetch(baseUrl + '/v1/fx?base=USD&symbols=INR');
    if (!fxResponse.ok) throw new Error('Production /v1/fx returned ' + fxResponse.status);
    const fxData = await fxResponse.json();
    if (!(Number(fxData.rates?.INR) > 0)) throw new Error('Production FX endpoint returned no USD/INR rate');
    await assertCalculator('currency-converter/', 'Currency converter live-rate flow');
    await page.locator('#calc-widget select[data-field="from"]').selectOption('USD');
    await page.locator('#calc-widget select[data-field="to"]').selectOption('INR');
    await page.locator('#calc-widget button[id$="-get-live-rate"]').click();
    await page.waitForFunction(() => document.querySelector('#calc-widget [id$="-fx-status"]')?.textContent.includes('Indicative rate'), null, { timeout: 15000 });
    if (await page.locator('#calc-widget .calc-result-row').count()) throw new Error('Fetching an FX rate must not auto-calculate the conversion');
    if (!(Number(await page.locator('#calc-widget input[data-field="rate"]').inputValue()) > 0)) throw new Error('Live FX button did not populate the exchange-rate field');
    await page.locator('#calc-widget button[id$="-calculate"]').click();
    await page.locator('#calc-widget .calc-result-row').first().waitFor({ state: 'visible', timeout: 5000 });
    await assertCalculator('income-tax-planner/', 'Income Tax Planner tax-engine flow');
    await page.locator('#calc-widget input[data-field="income"]').fill('1200000');
    await page.locator('#calc-widget input[data-field="deductions"]').fill('150000');
    await page.locator('#calc-widget select[id$="-india-tax-rebate"]').selectOption('yes');
    await page.locator('#calc-widget button[id$="-india-tax"]').click();
    await page.locator('#calc-widget .wa-india-tax-results:not([hidden])').waitFor({ state: 'visible', timeout: 15000 });
    const taxEngineText = await page.locator('#calc-widget .wa-india-tax-results').innerText();
    if (!taxEngineText.includes('Estimated total tax') || !taxEngineText.includes('Official tax guidance')) throw new Error('Income Tax Planner did not display the versioned tax engine result and source link');
  }

  await assertCalculator('cagr-calculator/', 'CAGR worked example');
  for (const [field, expected] of [['start','100000'],['end','161051'],['years','5']]) {
    await page.locator('#calc-widget input[data-field="' + field + '"]').fill(expected);
  }
  if (await page.locator('#calc-widget .calc-result-row').count()) throw new Error('CAGR must not calculate automatically while filling inputs');
  await page.locator('#calc-widget button[id$="-calculate"]').click();
  await page.locator('#calc-widget .calc-result-row').first().waitFor({ state: 'visible', timeout: 5000 });
  const cagrResult = await page.locator('#calc-widget .calc-result-value').allTextContents();
  if (!cagrResult.some(value => value.includes('10.00%'))) throw new Error('CAGR Calculate click did not produce the expected 10.00% result');
  const cagrExample = await page.locator('.tool-article').innerText();
  if (!cagrExample.includes('₹1,00,000') || !cagrExample.includes('₹1,61,051') || !cagrExample.includes('10.00%')) throw new Error('CAGR worked example is missing key verified values');

  await assertCalculator('income-tax-scenario-calculator/', 'Income tax scenario calculator');
  for (const [field, expected] of [['income','1200000'],['deductions','150000'],['rate','15']]) {
    await page.locator('#calc-widget input[data-field="' + field + '"]').fill(expected);
  }
  if (await page.locator('#calc-widget .calc-result-row').count()) throw new Error('Income tax scenario must not calculate automatically while filling inputs');
  await page.locator('#calc-widget button[id$="-calculate"]').click();
  await page.locator('#calc-widget .calc-result-row').first().waitFor({ state: 'visible', timeout: 5000 });
  const taxExample = await page.locator('.tool-article').innerText();
  for (const value of ['₹12,00,000','₹1,50,000','₹10,50,000','₹1,57,500','₹10,42,500']) {
    if (!taxExample.includes(value)) throw new Error('Income tax worked example is missing ' + value);
  }

  if (failedResponses.length) throw new Error(`Failed network responses: ${failedResponses.join(' | ')}`);
  if (errors.length) throw new Error(`Browser errors: ${errors.join(' | ')}`);
  console.log(`Production browser smoke passed at ${baseUrl}: homepage, all 47 calculators, explicit Calculate/Compare interactions, shareable inputs, local save/load, PDF download, and 375px mobile overflow checks are healthy.`);
} finally { await browser.close(); }
