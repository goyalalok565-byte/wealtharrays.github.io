import { chromium } from 'playwright';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
const page = await context.newPage();
const responseLog = [];
page.on('response', response => { if (response.status() >= 400) responseLog.push(`${response.status()} ${response.url()}`); });
const errors = [];
page.on('pageerror', error => {
  const message = String(error);
  if (!message.includes('adsbygoogle') && !message.includes('googletagmanager') && !message.includes('google-analytics')) {
    errors.push(message + (error?.stack ? `\n${error.stack}` : ''));
  }
});
const cases = [
  { slug:'sip-calculator', id:'sip' },
  { slug:'cagr-calculator', id:'cagr' },
  { slug:'mortgage-emi-calculator', id:'mortgage' }
];
try {
  for (const item of cases) {
    await page.goto(`${baseUrl.replace(/\/$/,'')}/${item.slug}.html`, {waitUntil:'domcontentloaded'});
    const button = page.locator('#calc-widget-embed');
    await button.waitFor({state:'visible',timeout:8000});
    await button.click();
    await page.waitForTimeout(100);
    const label = (await button.innerText()).trim();
    const copied = await page.evaluate(() => navigator.clipboard.readText().catch(() => ''));
    if (!/Embed copied/.test(label)) throw new Error(`Copy Embed did not report success on ${item.slug}: ${label}`);
    if (!copied.includes(`/widget?calc=${item.id}`)) throw new Error(`Clipboard embed URL is incorrect on ${item.slug}: ${copied}`);
    const widgetPath = '/widget.html';
    const widgetUrl = `${baseUrl.replace(/\/$/,'')}${widgetPath}?calc=${item.id}`;
    const widgetResponse = await page.goto(widgetUrl, {waitUntil:'domcontentloaded'});
    if (!widgetResponse || !widgetResponse.ok()) throw new Error(`Widget HTTP response was not OK for ${item.id}: ${widgetResponse?.status()} ${widgetUrl}`);
    await page.locator('#calc-widget input, #calc-widget select').first().waitFor({state:'visible',timeout:8000}).catch(async () => {
      const diagnostics = await page.evaluate(() => ({title:document.title, url:location.href, body:(document.body?.innerText||'').slice(0,1200), widget:document.querySelector('#calc-widget')?.outerHTML?.slice(0,1200)||null, scripts:[...document.scripts].map(s=>s.src).filter(Boolean)}));
      throw new Error(`Widget did not become visible for ${item.id}: ${JSON.stringify(diagnostics)} HTTP_ERRORS=${JSON.stringify(responseLog)}`);
    });
    if (!(await page.locator('#calc-widget').isVisible())) throw new Error(`Widget container not visible for ${item.id}`);
  }
  if (errors.length) throw new Error(`Browser page errors:\n${errors.join('\n---\n')}`);
  console.log(`Embed browser smoke PASS at ${baseUrl}: copy/embed flow and representative widgets work.`);
} finally {
  await context.close();
  await browser.close();
}
