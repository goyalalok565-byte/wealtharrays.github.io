import { chromium } from 'playwright';

const baseUrl = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const errors = [];
const failedResponses = [];
page.on('pageerror', error => errors.push(`pageerror: ${error}`));
page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
page.on('response', response => { if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`); });

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

async function assertCalculator(path, label) {
  errors.length = 0;
  failedResponses.length = 0;
  await page.goto(`${baseUrl}/${path}`, { waitUntil: 'networkidle' });
  try { await page.locator('#calc-widget').waitFor({ state: 'visible', timeout: 10000 }); }
  catch (error) { await diagnostics(label); throw new Error(`${label} failed to render at ${page.url()}: ${error.message}`); }
  if ((await page.locator('h1').count()) !== 1) throw new Error(`${label} must have exactly one H1`);
  if (!(await page.locator('#calc-widget input, #calc-widget select').count())) throw new Error(`${label} controls did not render`);
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
  await assertCalculator('sip-calculator.html', 'SIP calculator');
  if (failedResponses.length) throw new Error(`Failed network responses: ${failedResponses.join(' | ')}`);
  if (errors.length) throw new Error(`Browser errors: ${errors.join(' | ')}`);
  console.log(`Production browser smoke passed at ${baseUrl}: homepage CSS, one-H1 structure, stable calculator rendering and 390px mobile overflow checks are healthy.`);
} finally { await browser.close(); }