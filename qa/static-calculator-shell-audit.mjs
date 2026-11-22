import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { CALCULATORS } = require('../calculators.js');
const root = process.env.SITE_ROOT || '.';
let checked = 0;
for (const calc of CALCULATORS) {
  const file = path.join(root, calc.slug, 'index.html');
  if (!fs.existsSync(file)) throw new Error(`Missing calculator route: ${calc.slug}/index.html`);
  const html = fs.readFileSync(file, 'utf8');
  if (!/<div\b[^>]*id=["']calc-widget["'][^>]*class=["'][^"']*\bcalc-widget\b/i.test(html)) throw new Error(`${calc.slug}: static host class missing`);
  if (!html.includes('data-wa-static-shell="true"')) throw new Error(`${calc.slug}: static no-JS shell missing`);
  if (!html.includes('id="wa-calculator-critical-layout"')) throw new Error(`\${calc.slug}: inline critical calculator layout missing`);
  if (!html.includes('id="wa-calculator-nojs-reserve-reset"') || !html.includes('min-height: 520px !important')) throw new Error(`\${calc.slug}: no-JavaScript reserve reset missing`);
  if (!html.includes('data-wa-chart-placeholder="true"') || !/min-height:220px/.test(html)) throw new Error(`${calc.slug}: fixed chart placeholder missing`);
  const fieldCount = (html.match(/id="wa-static-[^"]+"/g) || []).length;
  if (fieldCount !== calc.fields.length) throw new Error(`${calc.slug}: expected ${calc.fields.length} static fields, found ${fieldCount}`);
  const mobileReserveHeights = { sip: 2100, swp: 2370, fire: 2540, 'rent-vs-buy': 3080 };
  const reserveHeight = mobileReserveHeights[calc.id];
  if (reserveHeight) {
    const reserveRule = `html[data-wa-calculator=\"${calc.id}\"] #calc-widget.calc-widget { min-height: ${reserveHeight}px; }`;
    if (!html.includes('@media (max-width: 760px)') || !html.includes(reserveRule)) throw new Error(`${calc.slug}: measured mobile CLS reservation missing or incorrect`);
  }
  checked++;
}
console.log(`Static calculator shell audit PASS: ${checked}/${CALCULATORS.length} routes have pre-rendered labels, inputs, result area and fixed chart placeholder.`);
