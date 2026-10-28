import fs from 'node:fs';
import vm from 'node:vm';

// Deterministic calculator regression + cross-surface catalogue integrity gate.
const source = fs.readFileSync('calculators.js', 'utf8');
const context = { console };
vm.createContext(context);
vm.runInContext(`${source}\n;globalThis.__WA_TEST_CALCULATORS__ = CALCULATORS;`, context, { filename: 'calculators.js' });
const calculators = context.__WA_TEST_CALCULATORS__;

const assert = (condition, message) => { if (!condition) throw new Error(message); };
assert(Array.isArray(calculators), 'CALCULATORS must be an array');
assert(calculators.length === 47, `Expected 47 calculators, found ${calculators.length}`);
const actualSlugs = calculators.map(c => c.slug);
assert(actualSlugs.every(Boolean), 'Every calculator must have a slug');
assert(new Set(actualSlugs).size === actualSlugs.length, 'Calculator slugs must be unique');

const homepage = fs.readFileSync('index.html', 'utf8');
const toolsPage = fs.readFileSync('tools.html', 'utf8');
const widgetSource = fs.readFileSync('widget.js', 'utf8');
const homeScript = fs.readFileSync('homepage-business.js', 'utf8');
const buildScript = fs.readFileSync('scripts/root-cause-build.mjs', 'utf8');
const searchSource = fs.readFileSync('calculator-search.js', 'utf8');
const llms = fs.readFileSync('llms.txt', 'utf8');
const sitemap = fs.readFileSync('sitemap.xml', 'utf8');

assert(!widgetSource.includes('value="${esc(f.default)}"'), 'Calculator numeric inputs must not be prefilled from sample defaults');
assert(widgetSource.includes('<option value="" selected disabled>Choose'), 'Calculator select inputs must start with a blank prompt');
assert(widgetSource.includes('autocomplete="off" required'), 'Calculator inputs must be required and avoid stale browser autofill');
assert(widgetSource.includes("addEventListener('click',recompute)"), 'Calculate button must trigger the calculation');
assert(!widgetSource.includes('if(inputsComplete())recompute()'), 'Calculator must not calculate automatically while editing inputs');
assert(widgetSource.includes('Values changed. Click Calculate result'), 'Edited inputs must require an explicit Calculate button click');
assert(!/<input[^>]+id="wa-emi-(?:principal|rate|years)"[^>]+\bvalue=/i.test(homepage), 'Homepage quick EMI inputs must start blank');
assert(homepage.includes('id="wa-emi-output" for="wa-emi-principal wa-emi-rate wa-emi-years">Enter values</output>'), 'Homepage quick EMI result should have a blank initial state');
assert(homeScript.includes("if(!String(principal.value).trim()||!String(rate.value).trim()||!String(years.value).trim())"), 'Homepage quick EMI must not show errors before the user enters values');
assert(buildScript.includes("styles.css?v='+stamp"), 'Build must cache-bust the global stylesheet URL');

function safeInput(field) {
  if (field.default !== undefined) return field.default;
  if (field.type === 'select') return field.options?.[0]?.value ?? '';
  if (typeof field.min === 'number') return field.min > 0 ? field.min : 1;
  return 1;
}

for (const calc of calculators) {
  assert(calc.id && calc.slug && calc.title && Array.isArray(calc.fields) && typeof calc.compute === 'function', `${calc.slug}: malformed definition`);
  const ids = calc.fields.map(f => f.id);
  assert(new Set(ids).size === ids.length, `${calc.slug}: duplicate field id`);

  for (const field of calc.fields) {
    if (field.type === 'number' && typeof field.default === 'number') {
      if (typeof field.min === 'number') assert(field.default >= field.min, `${calc.slug}/${field.id}: default below minimum`);
      if (typeof field.max === 'number') assert(field.default <= field.max, `${calc.slug}/${field.id}: default above maximum`);
    }
    if (field.type === 'select' && Array.isArray(field.options)) {
      assert(field.options.some(option => String(option.value) === String(field.default)), `${calc.slug}/${field.id}: default is not an available option`);
    }
  }

  const route = `/${calc.slug}/`;
  assert(homepage.includes(`href="${route}"`), `${calc.slug}: missing from homepage`);
  assert(toolsPage.includes(`href="${route}"`), `${calc.slug}: missing from /tools library or stale route`);
  assert(searchSource.includes(`"${route}"`), `${calc.slug}: missing from calculator search catalog or stale route`);
  assert(llms.includes(`https://wealtharrays.com${route}`), `${calc.slug}: missing from llms.txt`);
  assert(sitemap.includes(`https://wealtharrays.com${route}`), `${calc.slug}: missing from sitemap`);

  const safeDefaults = Object.fromEntries(calc.fields.map(f => [f.id, safeInput(f)]));
  let result;
  try { result = calc.compute(safeDefaults); } catch (error) { throw new Error(`${calc.slug}: valid-input calculation threw: ${error.message}; inputs=${JSON.stringify(safeDefaults)}`); }
  assert(Array.isArray(result) && result.length > 0, `${calc.slug}: no result rows`);
  for (const row of result) {
    assert(row && typeof row.label === 'string', `${calc.slug}: invalid result label`);
    assert(typeof row.value === 'number' && Number.isFinite(row.value), `${calc.slug}: non-finite valid-input result for ${row.label}; inputs=${JSON.stringify(safeDefaults)}`);
  }

  const zeroed = Object.fromEntries(calc.fields.map(f => [f.id, typeof f.default === 'number' ? 0 : (f.type === 'select' ? f.default ?? f.options?.[0]?.value ?? '' : 0)]));
  try { result = calc.compute(zeroed); } catch (error) { throw new Error(`${calc.slug}: zero-boundary calculation threw: ${error.message}; inputs=${JSON.stringify(zeroed)}`); }
  for (const row of result) assert(typeof row.value === 'number' && Number.isFinite(row.value), `${calc.slug}: zero-boundary non-finite result for ${row.label}; inputs=${JSON.stringify(zeroed)}`);
}

assert(!toolsPage.includes('/income-tax-scenario-calculator/'), 'Tools library still points to legacy income-tax route');
assert(!searchSource.includes('/income-tax-scenario-calculator/'), 'Search catalog still points to legacy income-tax route');
console.log('Calculator regression PASS — 47/47 definitions, blank-input UX, responsive runtime hooks, field bounds, finite outputs, homepage/tools/search/llms/sitemap parity passed.');
