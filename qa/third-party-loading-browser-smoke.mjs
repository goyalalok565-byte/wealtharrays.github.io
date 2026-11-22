import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 360, height: 800 } });
const page = await context.newPage();
let analyticsRequests = 0;
let rumRequests = 0;
let adRequests = 0;
await page.route('https://www.googletagmanager.com/**', async route => {
  analyticsRequests++;
  await route.fulfill({ status: 200, contentType: 'application/javascript', body: 'window.dataLayer=window.dataLayer||[];' });
});
await page.route('https://unpkg.com/web-vitals@6.2.3/dist/web-vitals.iife.js', async route => {
  rumRequests++;
  await route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: `window.webVitals={
      onCLS:function(callback){callback({name:'CLS',value:0.02,rating:'good'});},
      onINP:function(callback){callback({name:'INP',value:100,rating:'good'});},
      onLCP:function(callback){callback({name:'LCP',value:2000,rating:'good'});}
    };`
  });
});
await page.route('https://pagead2.googlesyndication.com/**', async route => {
  adRequests++;
  await route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
});
try {
  await page.goto(base + '/tools.html', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#wa-consent');
  await page.waitForTimeout(600);
  assert.equal(analyticsRequests, 0, 'GA4 must not load before analytics consent');
  assert.equal(rumRequests, 0, 'Core Web Vitals library must not load before analytics consent');
  assert.equal(adRequests, 0, 'AdSense must not load on a page without ad slots');

  await page.locator('#wa-consent [data-wa-consent="accept"]').click();
  await page.waitForFunction(() => Boolean(document.querySelector('script[data-wa-gtag]')));
  await page.waitForFunction(() => Boolean(document.querySelector('script[data-wa-web-vitals]')));
  await page.waitForFunction(() => (window.dataLayer || []).filter(args => args[0] === 'event' && args[1] === 'web_vitals').length === 3);
  assert.equal(analyticsRequests, 1, 'GA4 must load after explicit analytics consent');
  assert.equal(rumRequests, 1, 'Core Web Vitals library must load after explicit analytics consent');
  assert.equal(adRequests, 0, 'Accepting analytics must not enable AdSense');

  const metrics = await page.evaluate(() => (window.dataLayer || [])
    .filter(args => args[0] === 'event' && args[1] === 'web_vitals')
    .map(args => args[2]));
  assert.deepEqual(metrics.map(metric => metric.metric_name).sort(), ['CLS', 'INP', 'LCP']);
  for (const metric of metrics) {
    assert.deepEqual(Object.keys(metric).sort(), ['metric_name', 'metric_rating', 'metric_value']);
    assert.ok(!Object.keys(metric).some(key => /amount|principal|income|balance|input|result|email|token|session/i.test(key)));
  }
} finally {
  await context.close();
  await browser.close();
}
console.log('Third-party loading browser smoke PASS — GA4 and Core Web Vitals wait for explicit consent; only privacy-safe metrics are emitted; AdSense stays unloaded without an ad slot.');
