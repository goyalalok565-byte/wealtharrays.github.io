import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { CALCULATORS } = require('../calculators.js');
const root = process.cwd();
const dist = path.join(root, 'dist');
const fail = message => { throw new Error('Calculator embed offer audit failed: ' + message); };
const read = (base, file) => fs.readFileSync(path.join(base, file), 'utf8');
const route = 'calculator-embeds/index.html';
const source = read(root, route);
const built = read(dist, route);
const contact = read(dist, 'contact.html');
const sitemap = read(dist, 'sitemap.xml');
const builder = read(dist, 'calculator-embeds.js');
const registry = read(dist, 'calculators.js');
const hasBreakEven = Array.isArray(CALCULATORS) && CALCULATORS.some(calc => calc.id === 'break-even');
if (!hasBreakEven) fail('break-even calculator ID is not in the canonical registry');
if (!builder.includes('wa-embed-preview') || !builder.includes('wa-embed-copy')) fail('interactive embed picker or copy handler missing');
if (!registry.includes('id: "break-even"')) fail('public calculator registry missing break-even');
if (!source.includes('/calculator-embeds.js')) fail('embed builder script is not loaded by offer page');
if (!source.includes('id="wa-embed-search"') || !source.includes('id="wa-embed-category"')) fail('search and category controls missing');
for (const [label, html] of [['source', source], ['dist', built]]) {
  if (!html.includes('<link rel="canonical" href="https://wealtharrays.com/calculator-embeds/">')) fail(label + ': canonical URL missing');
  if (!/<meta name="robots" content="index,follow">/i.test(html)) fail(label + ': indexability directive missing');
  if (!html.includes('https://wealtharrays.com/widget/?calc=break-even')) fail(label + ': live demo iframe missing or incorrect');
  if (!/iframe[^>]+title="Wealth Arrays calculator widget preview"/i.test(html)) fail(label + ': iframe accessible title missing');
  if (!/loading="lazy"/i.test(html)) fail(label + ': iframe must lazy-load');
  if (!html.includes('mailto:goyalalok565@gmail.com?subject=Calculator%20Embed%20Enquiry')) fail(label + ': enquiry CTA missing');
  if (!html.includes('No public pricing or paid commitment')) fail(label + ': commercial boundary disclosure missing');
  if (!html.includes('API model coverage is limited')) fail(label + ': API coverage limitation missing');
}
if (!contact.includes('/calculator-embeds/')) fail('contact page does not link to the offer page');
if (!sitemap.includes('<loc>https://wealtharrays.com/calculator-embeds/</loc>')) fail('canonical sitemap entry missing');
console.log('Calculator embed offer audit PASS: canonical/indexable route, interactive calculator picker, live preview, copyable iframe code, accessible lazy iframe, enquiry CTA, commercial/API caveats, contact link and sitemap entry.');
