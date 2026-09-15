import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const warnings = [];
const htmlFiles = [];
const publicUrl = 'https://wealtharrays.com/';

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.well-known') continue;
    if (entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
}
walk(root);

const read = (file) => fs.readFileSync(file, 'utf8');
const rel = (file) => path.relative(root, file).replaceAll(path.sep, '/') || 'index.html';
const attr = (html, name, value) => {
  const re = new RegExp(`<meta[^>]+${name}=["']${value}["'][^>]+content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]+${name}=["']${value}["']`, 'i');
  const m = html.match(re);
  return (m?.[1] || m?.[2] || '').trim();
};
const canonical = (html) => html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1]?.trim() || '';
const title = (html) => html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
const h1Count = (html) => (html.match(/<h1\b/gi) || []).length;
const robots = (html) => attr(html, 'name', 'robots');
const indexable = (html) => !/noindex/i.test(robots(html));
const canonicalHost = (url) => url.startsWith(publicUrl);

const seenTitles = new Map();
const seenDescriptions = new Map();
for (const file of htmlFiles) {
  const html = read(file);
  const name = rel(file);
  const t = title(html);
  const d = attr(html, 'name', 'description');
  const c = canonical(html);
  const isIndexable = indexable(html);

  if (isIndexable) {
    if (!t) errors.push(`${name}: missing title`);
    if (!d) errors.push(`${name}: missing meta description`);
    if (!c) errors.push(`${name}: indexable page missing canonical`);
    if (c && !canonicalHost(c)) errors.push(`${name}: canonical is outside wealtharrays.com`);
    if (h1Count(html) !== 1) errors.push(`${name}: expected exactly one H1, found ${h1Count(html)}`);
  }

  if (isIndexable && t) {
    const list = seenTitles.get(t) || [];
    list.push(name); seenTitles.set(t, list);
  }
  if (isIndexable && d) {
    const list = seenDescriptions.get(d) || [];
    list.push(name); seenDescriptions.set(d, list);
  }
  if (/smart\.js/i.test(html)) errors.push(`${name}: retired smart.js reference found`);
}

for (const [value, pages] of seenTitles) if (pages.length > 1) errors.push(`Duplicate title: ${pages.join(', ')}`);
for (const [value, pages] of seenDescriptions) if (pages.length > 1) warnings.push(`Duplicate meta description: ${pages.join(', ')}`);

const sitemapPath = path.join(root, 'sitemap.xml');
const robotsPath = path.join(root, 'robots.txt');
const headersPath = path.join(root, '_headers');
if (!fs.existsSync(sitemapPath)) errors.push('sitemap.xml missing');
if (!fs.existsSync(robotsPath)) errors.push('robots.txt missing');
if (!fs.existsSync(headersPath)) errors.push('_headers missing');

let sitemapLocs = [];
if (fs.existsSync(sitemapPath)) {
  const sitemap = read(sitemapPath);
  sitemapLocs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
  if (!sitemapLocs.includes(publicUrl)) errors.push('sitemap does not contain canonical homepage');
  const seen = new Set();
  for (const url of sitemapLocs) {
    if (seen.has(url)) errors.push(`Duplicate sitemap URL: ${url}`);
    seen.add(url);
    if (!canonicalHost(url)) errors.push(`Sitemap URL outside canonical host: ${url}`);
    const pathname = new URL(url).pathname.replace(/^\//, '') || 'index.html';
    const target = path.join(root, pathname);
    if (!fs.existsSync(target)) errors.push(`Sitemap URL has no repository file: ${url}`);
    else if (target.endsWith('.html') && !indexable(read(target))) errors.push(`Sitemap contains noindex page: ${url}`);
  }
  if (sitemapLocs.length < 20) warnings.push(`Sitemap has only ${sitemapLocs.length} URLs; verify intentional coverage.`);
}

if (fs.existsSync(robotsPath)) {
  const robotsTxt = read(robotsPath);
  if (!/^User-agent:\s*\*/mi.test(robotsTxt)) errors.push('robots.txt missing wildcard user-agent');
  if (!/Sitemap:\s*https:\/\/wealtharrays\.com\/sitemap\.xml/i.test(robotsTxt)) errors.push('robots.txt missing canonical sitemap directive');
}

if (fs.existsSync(headersPath)) {
  const headers = read(headersPath);
  for (const required of ['Strict-Transport-Security:', 'Content-Security-Policy:', 'X-Content-Type-Options:', 'Referrer-Policy:', 'Permissions-Policy:']) {
    if (!headers.includes(required)) errors.push(`_headers missing ${required}`);
  }
  for (const required of ['www.googletagmanager.com', 'www.google-analytics.com', 'pagead2.googlesyndication.com', 'googleads.g.doubleclick.net']) {
    if (!headers.includes(required)) warnings.push(`CSP does not mention ${required}; re-check before enabling Google advertising/analytics scripts.`);
  }
}

for (const requiredFile of ['about.html', 'contact.html', 'privacy.html', 'terms.html', 'disclaimer.html', 'methodology.html', 'editorial-policy.html', 'advertising-policy.html', '404.html', 'og-image.png']) {
  if (!fs.existsSync(path.join(root, requiredFile))) errors.push(`Production trust/UX asset missing: ${requiredFile}`);
}

// The sitemap is the source of truth for the production calculator set. This avoids
// counting intentionally retired/legacy calculator URLs that remain in the repository.
const calculatorUrls = sitemapLocs.filter(url => {
  try {
    const pathname = new URL(url).pathname.replace(/^\//, '');
    return pathname.endsWith('-calculator.html') && !pathname.includes('/');
  } catch {
    return false;
  }
});
if (calculatorUrls.length !== 20) errors.push(`Expected 20 calculator pages in sitemap, found ${calculatorUrls.length}`);
for (const url of calculatorUrls) {
  const pathname = new URL(url).pathname.replace(/^\//, '');
  const file = path.join(root, pathname);
  if (!fs.existsSync(file)) continue;
  const html = read(file);
  const name = rel(file);
  if (!/calculators\.js/i.test(html)) errors.push(`${name}: calculator runtime missing`);
  if (!/formula|how it works|assumptions|limitations|estimate/i.test(html)) warnings.push(`${name}: educational/explanatory copy may be too thin`);
}

const analyticsMentioned = htmlFiles.some(file => /Google Analytics/i.test(read(file)));
const privacy = path.join(root, 'privacy.html');
if (analyticsMentioned && fs.existsSync(privacy) && !/Google Analytics/i.test(read(privacy))) errors.push('Analytics is referenced in site content but privacy policy does not explain it');

if (errors.length) {
  console.error(`LAUNCH READINESS FAILED (${errors.length} errors)`);
  errors.forEach(e => console.error(`- ${e}`));
  if (warnings.length) { console.error(`Warnings: ${warnings.length}`); warnings.forEach(w => console.error(`- ${w}`)); }
  process.exit(1);
}
console.log(`LAUNCH READINESS PASS: ${htmlFiles.length} HTML pages, ${calculatorUrls.length} sitemap calculators, sitemap, robots, security headers and trust assets validated.`);
if (warnings.length) { console.log(`Warnings: ${warnings.length}`); warnings.forEach(w => console.log(`- ${w}`); }