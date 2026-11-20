import { chromium } from 'playwright';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { CALCULATORS } = require('../calculators.js');
const base = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\\/$/, '');
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
  console.log(`Static calculator shell browser smoke PASS: ${CALCULATORS.length} routes rendered with JavaScript disabled.`);
} finally { await browser.close(); }
