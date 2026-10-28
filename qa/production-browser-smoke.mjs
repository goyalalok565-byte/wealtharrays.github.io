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
  for (const [field, expected] of [['monthly','200'],['rate','10'],['years','15']]) {
    const actual = await page.locator('#calc-widget input[data-field="' + field + '"]').inputValue();
    if (actual !== expected) throw new Error('SIP default ' + field + ' expected ' + expected + ', received ' + actual);
  }
  for (const field of ['monthly','rate','years']) {
    const control = page.locator('#calc-widget input[data-field="' + field + '"]');
    if (!(await control.inputValue())) await control.fill(field === 'monthly' ? '200' : field === 'rate' ? '10' : '15');
  }
  await page.locator('#calc-widget button[id$="-calculate"]').click();
  await page.locator('#calc-widget .calc-result-row').first().waitFor({ state: 'visible', timeout: 5000 });
  await page.locator('#calc-widget button[id$="-share"]').click();
  const sharePayload = await page.evaluate(() => window.__waSharePayload || null);
  if (!sharePayload?.url) throw new Error('Share scenario did not produce a share URL');
  const shareUrl = new URL(sharePayload.url);
  if (shareUrl.searchParams.get('wa_scenario') !== '1' || shareUrl.searchParams.get('wa_monthly') !== '200' || shareUrl.searchParams.get('wa_rate') !== '10' || shareUrl.searchParams.get('wa_years') !== '15') throw new Error('Share scenario URL did not preserve all SIP inputs');
  await page.goto(sharePayload.url, { waitUntil: 'networkidle' });
  for (const [field, expected] of [['monthly','200'],['rate','10'],['years','15']]) {
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
  await assertCalculator('cagr-calculator/', 'CAGR worked example');
  for (const [field, expected] of [['start','100000'],['end','161051'],['years','5']]) {
    const actual = await page.locator('#calc-widget input[data-field="' + field + '"]').inputValue();
    if (actual !== expected) throw new Error('CAGR default ' + field + ' expected ' + expected + ', received ' + actual);
  }
  const cagrExample = await page.locator('.tool-article').innerText();
  if (!cagrExample.includes('₹1,00,000') || !cagrExample.includes('₹1,61,051') || !cagrExample.includes('10.00%')) throw new Error('CAGR worked example is missing key verified values');

  await assertCalculator('income-tax-scenario-calculator/', 'Income tax scenario calculator');
  for (const [field, expected] of [['income','1200000'],['deductions','150000'],['rate','15']]) {
    const actual = await page.locator('#calc-widget input[data-field="' + field + '"]').inputValue();
    if (actual !== expected) throw new Error('Income tax default ' + field + ' expected ' + expected + ', received ' + actual);
  }
  const taxExample = await page.locator('.tool-article').innerText();
  for (const value of ['₹12,00,000','₹1,50,000','₹10,50,000','₹1,57,500','₹10,42,500']) {
    if (!taxExample.includes(value)) throw new Error('Income tax worked example is missing ' + value);
  }

  if (failedResponses.length) throw new Error(`Failed network responses: ${failedResponses.join(' | ')}`);
  if (errors.length) throw new Error(`Browser errors: ${errors.join(' | ')}`);
  console.log(`Production browser smoke passed at ${baseUrl}: homepage, all 47 calculators, explicit Calculate/Compare interactions, shareable inputs, local save/load, PDF download, and 375px mobile overflow checks are healthy.`);
} finally { await browser.close(); }
