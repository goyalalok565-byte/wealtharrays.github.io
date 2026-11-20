import { chromium } from 'playwright';
import fs from 'node:fs';
import vm from 'node:vm';

const calcContext = { window: {}, console };
vm.createContext(calcContext);
vm.runInContext(fs.readFileSync('calculators.js', 'utf8') + '\n;globalThis.__WA_TEST_CALCULATORS__=CALCULATORS;', calcContext);
const calculators = Array.from(calcContext.__WA_TEST_CALCULATORS__ || []);
if (calculators.length !== 55) throw new Error(`Expected 55 calculator definitions, found ${calculators.length}.`);

const baseUrl = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 2, acceptDownloads: true });
const page = await context.newPage();
const errors = [];
const failedResponses = [];
const ignoredConsole = /googlesyndication|doubleclick|fonts\.(googleapis|gstatic)|fundingchoices|ERR_BLOCKED_BY_CLIENT/i;
page.on('pageerror', error => errors.push(String(error)));
page.on('console', message => { if (message.type() === 'error' && !ignoredConsole.test(message.text())) errors.push(message.text()); });
page.on('response', response => {
  try {
    if (response.status() >= 400 && new URL(response.url()).origin === new URL(baseUrl).origin) failedResponses.push(`${response.status()} ${response.url()}`);
  } catch {}
});

async function dismissPrivacyChoices() {
  const dialog = page.locator('#wa-consent, [role="dialog"][aria-label*="Privacy" i]').first();
  if (!(await dialog.count()) || !(await dialog.isVisible().catch(() => false))) return;
  const choice = dialog.getByRole('button', { name: /reject(?: all)?|reject optional|essential only|necessary only|decline all|continue without accepting/i }).first();
  if (!(await choice.count())) throw new Error('Privacy dialog blocks test and no reject/essential-only option is available.');
  await choice.click();
  await dialog.waitFor({ state: 'hidden', timeout: 5000 });
}

function inputValue(field) {
  if (field.type === 'select') {
    const options = field.options || [];
    return String(field.default ?? options[0]?.value ?? '');
  }
  let value = Number(field.default);
  if (!Number.isFinite(value)) value = Number.isFinite(Number(field.min)) && Number(field.min) > 0 ? Number(field.min) : 1;
  if (field.min !== undefined && value < field.min) value = Number(field.min);
  if (field.max !== undefined && value > field.max) value = Number(field.max);
  return value;
}

let currencyTests = 0;
let themeTests = 0;
let languageTests = 0;
let languageMissing = 0;
let csvExports = 0;
let pdfExports = 0;

try {
  for (const calc of calculators) {
    errors.length = 0;
    failedResponses.length = 0;
    const label = `${calc.title} (${calc.slug})`;
    await page.goto(`${baseUrl}/${calc.slug}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.locator('#calc-widget [data-field]').first().waitFor({ state: 'visible', timeout: 15000 });
    await dismissPrivacyChoices();

    const inputValues = {};
    for (const field of calc.fields) {
      const selector = `#calc-widget [data-field="${field.id}"]`;
      const control = page.locator(selector);
      if (field.type === 'select') {
        const value = inputValue(field);
        if (value) await control.selectOption(value);
        inputValues[field.id] = value;
      } else {
        const value = inputValue(field);
        await control.fill(String(value));
        inputValues[field.id] = value;
      }
    }

    const calculate = page.locator('#calc-widget button[id$="-calculate"]');
    await calculate.click();
    await page.locator('#calc-widget .calc-result-row').first().waitFor({ state: 'visible', timeout: 7000 });
    const results = await page.locator('#calc-widget .calc-result-value').allTextContents();
    if (!results.length || results.some(value => /NaN|Infinity|undefined/i.test(value))) throw new Error(`${label}: invalid calculation output: ${results.join(' | ')}`);

    const expected = calc.compute(inputValues) || [];
    const hasCurrencyResult = expected.some(result => result.format === 'currency');
    const currency = page.locator('#currency-select');
    if (!(await currency.count())) throw new Error(`${label}: currency selector is missing.`);
    await currency.selectOption('USD');
    await page.waitForFunction(() => document.documentElement.dataset.currency === 'USD', null, { timeout: 5000 });
    if (hasCurrencyResult) {
      await page.waitForFunction(() => [...document.querySelectorAll('#calc-widget .calc-result-value')].some(node => /\$/.test(node.textContent || '')), null, { timeout: 5000 });
    }
    await currency.selectOption('INR');
    await page.waitForFunction(() => document.documentElement.dataset.currency === 'INR', null, { timeout: 5000 });
    currencyTests++;

    const themeButton = page.locator('#theme-toggle');
    if (!(await themeButton.count())) throw new Error(`${label}: theme toggle is missing.`);
    const beforeTheme = await page.locator('html').getAttribute('data-theme');
    await themeButton.click();
    await page.waitForFunction(before => document.documentElement.dataset.theme !== before, beforeTheme, { timeout: 5000 });
    await themeButton.click();
    await page.waitForFunction(before => document.documentElement.dataset.theme === before, beforeTheme, { timeout: 5000 });
    themeTests++;

    const language = page.locator('#language-select');
    if (await language.count()) {
      const original = await language.inputValue();
      const values = await language.locator('option').evaluateAll(options => options.map(option => option.value));
      const candidate = values.includes('hi') ? 'hi' : values.find(value => value && value !== original);
      if (candidate) {
        await language.selectOption(candidate);
        if (await language.inputValue() !== candidate) throw new Error(`${label}: language selector did not change value.`);
        await language.selectOption(original);
        languageTests++;
      } else languageMissing++;
    } else languageMissing++;

    const csvButton = page.locator('#calc-widget button[id$="-csv"]');
    if (!(await csvButton.count())) throw new Error(`${label}: CSV export control is missing.`);
    const csvPromise = page.waitForEvent('download', { timeout: 10000 });
    await csvButton.click();
    const csvDownload = await csvPromise;
    if (!csvDownload.suggestedFilename().endsWith('.csv')) throw new Error(`${label}: CSV export produced ${csvDownload.suggestedFilename()}.`);
    const csvPath = await csvDownload.path();
    const csvText = fs.readFileSync(csvPath, 'utf8');
    if (!csvText.includes(calc.title) || !csvText.includes('Result')) throw new Error(`${label}: CSV export is missing calculator/result data.`);
    csvExports++;

    const pdfButton = page.locator('#calc-widget button[id$="-export"]');
    if (!(await pdfButton.count())) throw new Error(`${label}: PDF export control is missing.`);
    const pdfPromise = page.waitForEvent('download', { timeout: 10000 });
    await pdfButton.click();
    const pdfDownload = await pdfPromise;
    if (!pdfDownload.suggestedFilename().endsWith('.pdf')) throw new Error(`${label}: PDF export produced ${pdfDownload.suggestedFilename()}.`);
    const pdfPath = await pdfDownload.path();
    if (!pdfPath || fs.statSync(pdfPath).size < 100) throw new Error(`${label}: PDF export is empty or missing.`);
    pdfExports++;

    if (errors.length) throw new Error(`${label}: browser errors: ${errors.join(' | ')}`);
    if (failedResponses.length) throw new Error(`${label}: failed same-origin requests: ${failedResponses.join(' | ')}`);
    console.log(`PASS ${calc.slug}: calculate, currency, theme, CSV, PDF${await language.count() ? ', language' : ''}`);
  }
  console.log(JSON.stringify({
    status: 'PASS',
    calculators: calculators.length,
    currencyTests,
    themeTests,
    languageTests,
    languageSelectorsMissing: languageMissing,
    csvExports,
    pdfExports,
    note: languageMissing ? 'No language selector was present on these calculator pages; language switching could not be exercised.' : 'Language switching exercised where available.'
  }, null, 2));
} finally {
  await browser.close();
}
