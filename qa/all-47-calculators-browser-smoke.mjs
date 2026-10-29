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
async function checkViewport(route, title, width) {
  await page.setViewportSize({ width, height: width < 600 ? 844 : 900 });
  await page.goto(baseUrl + '/' + route.replace(/^\//, '').replace(/\/$/, '') + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#calc-widget [data-field]');
  const dims = await page.evaluate(() => ({ inner: window.innerWidth, doc: document.documentElement.scrollWidth }));
  assert(dims.doc <= dims.inner + 2, title + ' horizontal overflow at ' + width + 'px (' + dims.doc + ' > ' + dims.inner + ')');
}
try {
  const calculators = SOURCE_CALCULATORS.map(c => ({
    id: c.id, slug: c.slug, title: c.title,
    fields: c.fields.map(f => ({ id: f.id, label: f.label, type: f.type, default: f.default, min: f.min, max: f.max, step: f.step, options: f.options }))
  }));
  assert(calculators.length === 47, 'Expected 47 source calculator definitions, found ' + calculators.length);
  assert(new Set(calculators.map(c => c.id)).size === 47, 'Calculator IDs are not unique');

  for (const calc of calculators) {
    try {
      await checkViewport(calc.slug, calc.title, 375);
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

      // Check the minimum bound for each numeric field and every declared maximum, one field at a time.
      for (const boundField of calc.fields.filter(f => f.type !== 'select')) {
        const bounds = [];
        if (boundField.min !== undefined) bounds.push(['min', Number(boundField.min)]);
        if (boundField.max !== undefined) bounds.push(['max', Number(boundField.max)]);
        for (const [kind, bound] of bounds) {
          const input = page.locator('#f-' + boundField.id);
          const old = await input.inputValue();
          if (Number(old) === bound) continue;
          await input.fill(String(bound));
          await page.locator('#calc-widget button[id$="-calculate"]').click();
          const boundRows = page.locator('#calc-widget .calc-result-row');
          assert(await boundRows.count() > 0, calc.id + ': ' + boundField.id + ' ' + kind + ' bound returned no result');
          const vals = await boundRows.locator('.calc-result-value').allTextContents();
          assert(vals.every(v => v.trim() && !/NaN|Infinity|undefined|null|^—$/.test(v.trim())), calc.id + ': non-finite output at ' + boundField.id + ' ' + kind + ' bound');
          // Restore the field so the next boundary check starts from the current normal state.
          await input.fill(old);
          await page.locator('#calc-widget button[id$="-calculate"]').click();
        }
      }

      // Confirm tablet and desktop layouts do not overflow, independently for each calculator route.
      for (const width of [768, 1280]) {
        await checkViewport(calc.slug, calc.title, width);
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
