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

try {
  await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
  const stylesheet = await page.locator('link[rel="stylesheet"][href*="styles.css"]').count();
  if (!stylesheet) throw new Error('Homepage stylesheet link is missing');
  const bodyDisplay = await page.locator('body').evaluate(el => getComputedStyle(el).display);
  if (bodyDisplay === 'inline') throw new Error('Homepage body is rendering with inline/default styling; CSS may be missing');
  if ((await page.locator('h1').count()) !== 1) throw new Error('Homepage must have exactly one H1');

  await page.goto(`${baseUrl}/sip-calculator.html`, { waitUntil: 'networkidle' });
  await page.locator('#calc-widget').waitFor({ state: 'visible', timeout: 10000 });
  if ((await page.locator('h1').count()) !== 1) throw new Error('SIP calculator must have exactly one H1');
  if (!(await page.locator('#calc-widget input, #calc-widget select').count())) throw new Error('SIP calculator controls did not render');

  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
  if (mobileOverflow) throw new Error('SIP calculator has horizontal overflow at 390px viewport');

  if (failedResponses.length) throw new Error(`Failed network responses: ${failedResponses.join(' | ')}`);
  if (errors.length) throw new Error(`Browser errors: ${errors.join(' | ')}`);
  console.log(`Production browser smoke passed at ${baseUrl}: homepage CSS, one-H1 structure, SIP calculator rendering and mobile overflow checks are healthy.`);
} finally {
  await browser.close();
}
