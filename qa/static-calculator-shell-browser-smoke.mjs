import { chromium } from 'playwright';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { CALCULATORS } = require('../calculators.js');
const base = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 360, height: 800 } });
  for (const calc of CALCULATORS) {
    const response = await page.goto(`${base}/${calc.slug}/`, { waitUntil: 'domcontentloaded' });
    if (!response?.ok()) throw new Error(`${calc.slug}: HTTP ${response?.status()}`);
    const host = page.locator('#calc-widget.calc-widget');
    const shell = page.locator('#calc-widget [data-wa-static-shell="true"]');
    if (await host.count() !== 1 || await shell.count() !== 1) throw new Error(`${calc.slug}: static shell not present with JavaScript disabled`);
    const inputs = await shell.locator('input,select').count();
    if (inputs !== calc.fields.length) throw new Error(`${calc.slug}: expected ${calc.fields.length} fields, found ${inputs}`);
    const chartHeight = await shell.locator('[data-wa-chart-placeholder]').evaluate(node => node.getBoundingClientRect().height);
    if (chartHeight < 220) throw new Error(`${calc.slug}: chart placeholder height ${chartHeight}px is below 220px`);
    const hostHeight = await host.evaluate(node => node.getBoundingClientRect().height);
    if (hostHeight < 520) throw new Error(`${calc.slug}: host height ${hostHeight}px is below 520px`);
  }
  // Capture the actual LayoutShift source rectangles on the four mobile release routes.
  // This is diagnostic-only: it does not change the release threshold or production behavior.
  const diagnosticPage = await browser.newPage({ viewport: { width: 360, height: 800 } });
  await diagnosticPage.addInitScript(() => {
    window.__waLayoutShifts = [];
    if (window.PerformanceObserver && PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) continue;
          window.__waLayoutShifts.push({
            value: entry.value,
            startTime: entry.startTime,
            sources: (entry.sources || []).map(source => ({
              selector: source.node?.id ? '#' + source.node.id : (source.node?.tagName || 'unknown'),
              previousRect: source.previousRect,
              currentRect: source.currentRect
            }))
          });
        }
      }).observe({ type: 'layout-shift', buffered: true });
    }
  });
  for (const slug of ['sip-calculator', 'swp-calculator', 'fire-calculator', 'rent-vs-buy-calculator']) {
    const response = await diagnosticPage.goto(`${base}/${slug}/`, { waitUntil: 'domcontentloaded' });
    if (!response?.ok()) throw new Error(`${slug}: diagnostic HTTP ${response?.status()}`);
    await diagnosticPage.waitForFunction(() => document.getElementById('calc-widget')?.dataset.waBooted === '1', null, { timeout: 15000 });
    await diagnosticPage.waitForTimeout(8000);
    const diagnostic = await diagnosticPage.evaluate(() => {
      const host = document.getElementById('calc-widget');
      const rect = host?.getBoundingClientRect();
      return {
        host: host ? {
          top: rect.top, bottom: rect.bottom, height: rect.height,
          minHeight: getComputedStyle(host).minHeight,
          booted: host.dataset.waBooted
        } : null,
        shifts: window.__waLayoutShifts || []
      };
    });
    console.log(`CLS source diagnostic ${slug}: ${JSON.stringify(diagnostic)}`);
  }
  await diagnosticPage.close();
  console.log(`Static calculator shell browser smoke PASS: ${CALCULATORS.length} routes rendered with JavaScript disabled.`);
} finally { await browser.close(); }
