import { chromium } from 'playwright';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { CALCULATORS: SOURCE_CALCULATORS } = require('../calculators.js');

const baseUrl = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 375, height: 844 } });
page.setDefaultTimeout(7000);
const failures = [];
const passes = [];
const pageErrors = [];
page.on('pageerror', error => pageErrors.push(error.message));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function closeEnough(a, b) {
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= Math.max(0.011, Math.abs(b) * 1e-8);
}
function initialValue(field) {
  let value = field.default;
  if (value === undefined || value === null || value === '') {
    value = field.type === 'select' ? (field.options?.[0]?.value ?? '') : (field.min ?? 1);
  }
  if (field.type === 'select') return String(value);
  value = Number(value);
  if (!Number.isFinite(value)) value = Number(field.min ?? 1);
  if (field.min !== undefined) value = Math.max(value, Number(field.min));
  if (field.max !== undefined) value = Math.min(value, Number(field.max));
  return String(value);
}
function changedNumber(field, current) {
  const min = Number.isFinite(Number(field.min)) ? Number(field.min) : 0;
  const max = Number.isFinite(Number(field.max)) ? Number(field.max) : Math.max(current * 4 + 1000, 1000);
  let next = current + Math.max(Math.abs(current) * 0.73, 123);
  if (next > max) next = current - Math.max(Math.abs(current) * 0.37, 1);
  if (next < min) next = min;
  if (next === current) {
    next = current + 1;
    if (next > max) next = current - 1;
  }
  if (next < min || next > max || next === current) return null;
  return String(next);
}
async function checkViewport(title, width) {
  // Reuse the already hydrated calculator page; resizing is sufficient to test responsive overflow.
  // Re-navigation at every width multiplies 55 routes into 165 full browser loads.
  await page.setViewportSize({ width, height: width < 600 ? 844 : 900 });
  await page.waitForTimeout(60);
  const dims = await page.evaluate(() => ({ inner: window.innerWidth, doc: document.documentElement.scrollWidth }));
  assert(dims.doc <= dims.inner + 2, title + ' horizontal overflow at ' + width + 'px (' + dims.doc + ' > ' + dims.inner + ')');
}
try {
  const calculators = SOURCE_CALCULATORS.map(c => ({
    id: c.id, slug: c.slug, title: c.title,
    fields: c.fields.map(f => ({ id: f.id, label: f.label, type: f.type, default: f.default, min: f.min, max: f.max, step: f.step, options: f.options }))
  }));
  assert(calculators.length > 0, 'Canonical calculator registry must not be empty');
  assert(new Set(calculators.map(c => c.id)).size === calculators.length, 'Calculator IDs are not unique');

  for (const calc of calculators) {
    try {
      await page.setViewportSize({ width: 375, height: 844 });
      await page.goto(baseUrl + '/' + calc.slug.replace(/^\//, '').replace(/\/$/, '') + '/', { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#calc-widget [data-field]');
      await checkViewport(calc.title, 375);
      const browserFields = page.locator('#calc-widget [data-field]');
      assert(await browserFields.count() === calc.fields.length, calc.id + ': rendered field count does not match definition');

      // A blank submission must produce validation feedback, never a calculated result.
      await page.locator('#calc-widget button[id$="-calculate"]').click();
      assert(await page.locator('#calc-widget .calc-result-row').count() === 0, calc.id + ': blank inputs produced result rows');

      // Fill each field with a valid, deterministic value.
      for (const field of calc.fields) {
        const input = page.locator('#f-' + field.id);
        if (field.type === 'select') await input.selectOption(initialValue(field));
        else await input.fill(initialValue(field));
      }
      assert(await page.locator('#calc-widget .calc-result-row').count() === 0, calc.id + ': calculated before Calculate click');

      // Click-to-calculate must render every expected output, with values matching the calculator model.
      await page.locator('#calc-widget button[id$="-calculate"]').click();
      const expected = await page.evaluate(id => {
        const c = window.CALCULATORS.find(item => item.id === id);
        const values = Object.fromEntries(c.fields.map(f => {
          const input = document.getElementById('f-' + f.id);
          return [f.id, f.type === 'select' ? input.value : Number(input.value)];
        }));
        return c.compute(values).map(r => ({ label: r.label, value: r.value, formatted: window.waFormatValue(r.value, r.format) }));
      }, calc.id);
      const rows = page.locator('#calc-widget .calc-result-row');
      assert(await rows.count() === expected.length, calc.id + ': rendered result count mismatch; expected ' + expected.length + ', got ' + await rows.count());
      for (let i = 0; i < expected.length; i++) {
        const row = rows.nth(i);
        assert((await row.locator('.calc-result-label').innerText()).trim() === expected[i].label, calc.id + ': output label mismatch at row ' + i);
        const actual = (await row.locator('.calc-result-value').innerText()).trim();
        assert(actual === expected[i].formatted, calc.id + ': rendered value mismatch for ' + expected[i].label + ' (got ' + actual + ', expected ' + expected[i].formatted + ')');
        assert(!/NaN|Infinity|undefined|null|^—$/.test(actual), calc.id + ': invalid rendered value for ' + expected[i].label + ': ' + actual);
      }
      const before = await rows.allTextContents();

      // Edit a meaningful numeric input: old results must be invalidated and must not recalculate until clicked.
      const field = calc.fields.find(f => f.type !== 'select' && changedNumber(f, Number(initialValue(f))) !== null);
      assert(field, calc.id + ': no mutable numeric input found');
      const oldValue = Number(initialValue(field));
      const nextValue = changedNumber(field, oldValue);
      await page.locator('#f-' + field.id).fill(nextValue);
      assert(await page.locator('#calc-widget .calc-result-row').count() === 0, calc.id + ': old result stayed visible or auto-calculated after editing');
      const editMessage = (await page.locator('#calc-widget-result').innerText()).toLowerCase();
      assert(editMessage.includes('click calculate') || editMessage.includes('complete all fields'), calc.id + ': edit state did not explain how to recalculate');
      await page.locator('#calc-widget button[id$="-calculate"]').click();
      const afterRows = await page.locator('#calc-widget .calc-result-row').allTextContents();
      assert(afterRows.length === before.length, calc.id + ': result rows disappeared after recalculation');
      assert(afterRows.some((row, i) => row !== before[i]), calc.id + ': output did not change after a meaningful input change');

      if (calc.id === 'capital-gain') {
        for (const [id, value] of [['purchase', 1000000], ['sale', 900000], ['buyCosts', 50000], ['sellCosts', 30000], ['taxRate', 10]]) {
          await page.locator('#f-' + id).fill(String(value));
        }
        await page.locator('#calc-widget button[id$="-calculate"]').click();
        const lossValues = await page.locator('#calc-widget .calc-result-value').allTextContents();
        const expectedLoss = await page.evaluate(() => ({
          loss: window.waFormatValue(-180000, 'currency'),
          tax: window.waFormatValue(0, 'currency')
        }));
        assert(lossValues[0].trim() === expectedLoss.loss, 'capital-gain: a 180,000 net loss must display as a negative amount');
        assert(lossValues[1].trim() === expectedLoss.tax, 'capital-gain: assumed tax on a net loss must be zero');
        assert(lossValues[2].trim() === expectedLoss.loss, 'capital-gain: after-tax result must preserve the loss');
      }

      if (calc.id === 'roi') {
        for (const [id, value] of [['cost', 0], ['finalValue', 1000], ['years', 5]]) await page.locator('#f-' + id).fill(String(value));
        await page.locator('#calc-widget button[id$="-calculate"]').click();
        await page.waitForFunction(() => [...document.querySelectorAll('#calc-widget .calc-result-label')].some(el => el.textContent.includes('not defined: cost is 0')), null, { timeout: 5000 });
        const rows = page.locator('#calc-widget .calc-result-row');
        const labels = [];
        const values = [];
        for (let i = 0; i < await rows.count(); i++) {
          labels.push((await rows.nth(i).locator('.calc-result-label').innerText()).trim());
          values.push((await rows.nth(i).locator('.calc-result-value').innerText()).trim());
        }
        assert(labels[1].includes('not defined: cost is 0') && labels[2].includes('not defined: cost is 0'), 'roi: zero-cost ratios must be explicitly undefined');
        assert(values[1].trim() === '—' && values[2].trim() === '—', 'roi: undefined ratios must not display as 0%');
      }
      if (calc.id === 'profit-margin') {
        for (const [id, value] of [['revenue', 0], ['cogs', 0], ['expenses', 0]]) await page.locator('#f-' + id).fill(String(value));
        await page.locator('#calc-widget button[id$="-calculate"]').click();
        await page.waitForFunction(() => [...document.querySelectorAll('#calc-widget .calc-result-label')].some(el => el.textContent.includes('not defined: revenue is 0')), null, { timeout: 5000 });
        const rows = page.locator('#calc-widget .calc-result-row');
        const labels = [];
        const values = [];
        for (let i = 0; i < await rows.count(); i++) {
          labels.push((await rows.nth(i).locator('.calc-result-label').innerText()).trim());
          values.push((await rows.nth(i).locator('.calc-result-value').innerText()).trim());
        }
        assert(labels[1].includes('not defined: revenue is 0') && labels[3].includes('not defined: revenue is 0'), 'profit-margin: zero-revenue ratios must be explicitly undefined');
        assert(values[1].trim() === '—' && values[3].trim() === '—', 'profit-margin: undefined margins must not display as 0%');
      }

      // Exercise every declared numeric min/max through the real Calculate event.
      // Batch browser-side interactions per route to avoid thousands of Playwright round trips.
      const boundaryChecks = calc.fields.filter(f => f.type !== 'select').flatMap(f => [
        ...(f.min === undefined ? [] : [{ fieldId: f.id, kind: 'min', value: Number(f.min) }]),
        ...(f.max === undefined ? [] : [{ fieldId: f.id, kind: 'max', value: Number(f.max) }])
      ]);
      const boundaryResults = await page.evaluate(async checks => {
        const button = document.querySelector('#calc-widget button[id$="-calculate"]');
        const nextFrame = () => new Promise(resolve => requestAnimationFrame(() => resolve()));
        const results = [];
        for (const check of checks) {
          const input = document.getElementById('f-' + check.fieldId);
          if (!input) {
            results.push({ ...check, error: 'field missing' });
            continue;
          }
          const previous = input.value;
          if (Number(previous) === check.value) continue;
          input.value = String(check.value);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          button.click();
          await nextFrame();
          const rows = [...document.querySelectorAll('#calc-widget .calc-result-row')];
          const values = rows.map(row => row.querySelector('.calc-result-value')?.textContent?.trim() || '');
          results.push({
            ...check,
            rowCount: rows.length,
            invalidValues: values.filter(value => !value || /NaN|Infinity|undefined|null|^—$/.test(value))
          });
          input.value = previous;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          button.click();
          await nextFrame();
        }
        return results;
      }, boundaryChecks);
      for (const result of boundaryResults) {
        assert(!result.error, calc.id + ': ' + result.fieldId + ' field missing at ' + result.kind + ' bound');
        assert(result.rowCount > 0, calc.id + ': ' + result.fieldId + ' ' + result.kind + ' bound returned no result');
        assert(result.invalidValues.length === 0, calc.id + ': invalid output at ' + result.fieldId + ' ' + result.kind + ' bound');
      }

      // Confirm tablet and desktop layouts do not overflow, independently for each calculator route.
      for (const width of [768, 1280]) {
        await checkViewport(calc.title, width);
      }
      passes.push({ id: calc.id, title: calc.title, fields: calc.fields.length, outputs: expected.length, status: 'PASS' });
      console.log('PASS ' + calc.id + ' — valid outputs, click-only calculation, changed-input recalculation, min/max bounds, 375/768/1280px');
    } catch (error) {
      failures.push({ id: calc.id, title: calc.title, error: error.message });
      console.error('FAIL ' + calc.id + ': ' + error.message);
    }
  }
  if (pageErrors.length) {
    failures.push({ id: 'browser-console', title: 'Browser runtime', error: pageErrors.join(' | ') });
  }
  console.log(JSON.stringify({ audited: calculators.length, passed: passes.length, failed: failures.length, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await browser.close();
}
