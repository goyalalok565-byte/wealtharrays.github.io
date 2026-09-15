import { chromium } from 'playwright';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(String(error)));

try {
  await page.goto(`${baseUrl.replace(/\/$/, '')}/index.html`, { waitUntil: 'networkidle' });
  const input = page.locator('#tool-search');
  if (!(await input.count())) throw new Error(`Homepage search input is missing at ${baseUrl}`);

  await input.fill('sip');
  const results = page.locator('#tool-search-results .wa-search-suggestion');
  await results.first().waitFor({ state: 'visible', timeout: 5000 });

  const firstHref = await results.first().getAttribute('href');
  const firstTitle = (await results.first().innerText()).trim();
  if (firstHref !== '/sip-calculator.html') throw new Error(`Unexpected SIP result href: ${firstHref}`);
  if (!/SIP Calculator/i.test(firstTitle)) throw new Error(`Unexpected SIP result title: ${firstTitle}`);

  await input.fill('emi');
  await results.first().waitFor({ state: 'visible', timeout: 5000 });
  const emiHref = await results.first().getAttribute('href');
  if (emiHref !== '/mortgage-emi-calculator.html') throw new Error(`Unexpected EMI result href: ${emiHref}`);

  await input.fill('tax');
  await results.first().waitFor({ state: 'visible', timeout: 5000 });
  const taxHref = await results.first().getAttribute('href');
  if (taxHref !== '/income-tax-scenario-calculator.html') throw new Error(`Unexpected tax result href: ${taxHref}`);

  console.log(`Homepage calculator search smoke test passed at ${baseUrl}.`);
  if (errors.length) throw new Error(`Browser page errors: ${errors.join(' | ')}`);
} finally {
  await browser.close();
}
