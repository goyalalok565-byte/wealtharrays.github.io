import { chromium } from 'playwright';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.route('**/*', async route => {
  const u = route.request().url();
  if (/googlesyndication|google-analytics|googletagmanager|doubleclick|adtrafficquality|cloudflareinsights/.test(u)) return route.abort();
  return route.continue();
});
const errors = [];
await page.addInitScript(() => {
  window.__WA_BROWSER_ERRORS__ = [];
  window.addEventListener('error', event => window.__WA_BROWSER_ERRORS__.push(event.error?.stack || event.message || 'unknown window error'));
  window.addEventListener('unhandledrejection', event => window.__WA_BROWSER_ERRORS__.push(String(event.reason?.stack || event.reason || 'unknown rejection')));
});
page.on('pageerror', error => {
  const message = String(error);
  // Google ad-quality/consent code can emit an empty rejected promise in production.
  // Treat only this non-diagnostic empty rejection as ignorable; real page errors still fail.
  if (message !== 'Error: Uncaught (in promise) undefined' && message !== 'Uncaught (in promise) undefined') errors.push(message);
});

try {
  await page.goto(`${baseUrl.replace(/\/$/, '')}/index.html`, { waitUntil: 'networkidle' });
  const input = page.locator('#tool-search');
  if (!(await input.count())) throw new Error(`Homepage search input is missing at ${baseUrl}`);

  await input.fill('sip');
  const results = page.locator('#tool-search-results .wa-search-suggestion');
  await results.first().waitFor({ state: 'visible', timeout: 5000 });

  const firstHref = await results.first().getAttribute('href');
  const firstTitle = (await results.first().innerText()).trim();
  if (new URL(firstHref, page.url()).pathname !== '/sip-calculator/') throw new Error(`Unexpected SIP result href: ${firstHref}`);
  if (!/SIP Calculator/i.test(firstTitle)) throw new Error(`Unexpected SIP result title: ${firstTitle}`);

  await input.fill('emi');
  await results.first().waitFor({ state: 'visible', timeout: 5000 });
  const emiHref = await results.first().getAttribute('href');
  if (new URL(emiHref, page.url()).pathname !== '/mortgage-emi-calculator/') throw new Error(`Unexpected EMI result href: ${emiHref}`);

  await input.fill('tax');
  await results.first().waitFor({ state: 'visible', timeout: 5000 });
  const taxHref = await results.first().getAttribute('href');
  if (new URL(taxHref, page.url()).pathname !== '/income-tax-scenario-calculator/') throw new Error(`Unexpected tax result href: ${taxHref}`);

  const browserErrors = await page.evaluate(() => window.__WA_BROWSER_ERRORS__ || []);
  if (browserErrors.length) throw new Error(`Browser page errors:\n${browserErrors.join('\n---\n')}\nPlaywright: ${errors.join(' | ')}`);
  console.log(`Homepage calculator search smoke test passed at ${baseUrl}.`);
} finally {
  await browser.close();
}
