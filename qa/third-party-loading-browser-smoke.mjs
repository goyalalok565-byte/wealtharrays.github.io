import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 360, height: 800 } });
let analyticsRequests = 0;
let adRequests = 0;
await page.route('https://www.googletagmanager.com/**', async route => {
  analyticsRequests++;
  await route.fulfill({ status: 200, contentType: 'application/javascript', body: 'window.dataLayer=window.dataLayer||[];' });
});
await page.route('https://pagead2.googlesyndication.com/**', async route => {
  adRequests++;
  await route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
});
await page.goto(base + '/tools.html', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#wa-consent');
await page.waitForTimeout(600);
assert.equal(analyticsRequests, 0, 'GA4 must not load before analytics consent');
assert.equal(adRequests, 0, 'AdSense must not load on a page without ad slots');
await page.locator('#wa-consent [data-wa-consent="accept"]').click();
await page.waitForFunction(() => Boolean(document.querySelector('script[data-wa-gtag]')));
await page.waitForTimeout(150);
assert.equal(analyticsRequests, 1, 'GA4 must load after explicit analytics consent');
assert.equal(adRequests, 0, 'Accepting analytics must not enable AdSense');
await browser.close();
console.log('Third-party loading browser smoke PASS — GA4 waits for explicit consent; AdSense stays unloaded without an ad slot.');
