import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const htmlFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
}
walk(root);

const errors = [];
const warnings = [];
const exists = target => fs.existsSync(target) && fs.statSync(target).isFile();
const internal = href => href && !/^(https?:|mailto:|tel:|javascript:|data:|#)/i.test(href);
const asset = href => /\.(?:css|js|mjs|json|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|xml|txt|webmanifest)(?:[?#].*)?$/i.test(href);
function resolvesPage(file, clean) {
  const target = clean.startsWith('/') ? path.join(root, clean.slice(1)) : path.resolve(path.dirname(file), clean);
  if (exists(target)) return true;
  if (fs.existsSync(target) && fs.statSync(target).isDirectory() && exists(path.join(target, 'index.html'))) return true;
  if (!path.extname(target) && exists(`${target}.html`)) return true;
  return false;
}

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file) || 'index.html';
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').trim();
  const description = (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] || '').trim();
  const canonical = (html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i)?.[1] || '').trim();
  if (!title) errors.push(`${rel}: missing <title>`);
  if (!description) warnings.push(`${rel}: missing meta description`);
  if (!canonical && !/index\.html$/.test(rel) && !/^(404|widget)\.html$/.test(path.basename(rel))) warnings.push(`${rel}: missing canonical`);
  const hrefs = [...html.matchAll(/\bhref=["']([^"']+)["']/gi)].map(m => m[1]);
  for (const href of hrefs) {
    if (!internal(href) || asset(href)) continue;
    const clean = href.split('#')[0].split('?')[0];
    if (!clean || clean === '/') continue;
    if (!resolvesPage(file, clean)) errors.push(`${rel}: broken internal link -> ${href}`);
  }
  const robots = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i)?.[1] || '';
  if (/noindex/i.test(robots) && /sitemap\.xml/.test(fs.existsSync(path.join(root,'sitemap.xml')) ? fs.readFileSync(path.join(root,'sitemap.xml'),'utf8') : '')) {
    if (canonical && canonical.includes('wealtharrays.com')) warnings.push(`${rel}: noindex page should not be in sitemap`);
  }
}

const sitemap = fs.existsSync(path.join(root, 'sitemap.xml')) ? fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8') : '';
if (!sitemap) errors.push('sitemap.xml is missing');
if (!fs.existsSync(path.join(root, 'robots.txt'))) errors.push('robots.txt is missing');
if (sitemap && !sitemap.includes('<loc>https://wealtharrays.com/</loc>')) errors.push('sitemap.xml does not contain the canonical homepage');

if (errors.length) {
  console.error(`SITE INTEGRITY FAILED (${errors.length} errors)`);
  errors.forEach(e => console.error(`- ${e}`));
  if (warnings.length) { console.error(`Warnings: ${warnings.length}`); warnings.forEach(w => console.error(`  - ${w}`)); }
  process.exit(1);
}
console.log(`SITE INTEGRITY PASS: ${htmlFiles.length} HTML pages checked, internal page links resolve, sitemap/robots present.`);
if (warnings.length) { console.log(`Warnings: ${warnings.length}`); warnings.slice(0, 20).forEach(w => console.log(`- ${w}`)); }
