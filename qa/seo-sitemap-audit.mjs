import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.env.SITE_ROOT || (fs.existsSync('dist') ? 'dist' : '.'));
const sitemapPath = path.join(root, 'sitemap.xml');
const robotsPath = path.join(root, 'robots.txt');
const errors = [];
const expectedOrigin = 'https://wealtharrays.com';

if (!fs.existsSync(sitemapPath)) errors.push('sitemap.xml is missing');
if (!fs.existsSync(robotsPath)) errors.push('robots.txt is missing');

const sitemap = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, 'utf8') : '';
const robots = fs.existsSync(robotsPath) ? fs.readFileSync(robotsPath, 'utf8') : '';
const locations = [...sitemap.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map(match => match[1].trim());
if (!locations.length) errors.push('sitemap.xml contains no <loc> entries');

const seen = new Set();
function pageExists(url) {
  const pathname = decodeURIComponent(new URL(url).pathname);
  const relative = pathname.replace(/^\/+/, '');
  const target = path.join(root, relative);
  if (fs.existsSync(target) && fs.statSync(target).isFile()) return true;
  if (fs.existsSync(target) && fs.statSync(target).isDirectory() && fs.existsSync(path.join(target, 'index.html'))) return true;
  if (!path.extname(target) && fs.existsSync(path.join(target, 'index.html'))) return true;
  if (!path.extname(target) && fs.existsSync(target + '.html')) return true;
  if (pathname === '/' && fs.existsSync(path.join(root, 'index.html'))) return true;
  return false;
}

for (const raw of locations) {
  let url;
  try { url = new URL(raw); } catch { errors.push('Invalid sitemap URL: ' + raw); continue; }
  if (url.origin !== expectedOrigin) errors.push('Non-canonical sitemap origin: ' + raw);
  if (url.search || url.hash) errors.push('Sitemap URL contains query/hash: ' + raw);
  if (seen.has(url.href)) errors.push('Duplicate sitemap URL: ' + raw);
  seen.add(url.href);
  if (!pageExists(url.href)) errors.push('Sitemap URL has no built page: ' + raw);
}
if (!/^Sitemap:\s*https:\/\/wealtharrays\.com\/sitemap\.xml\s*$/im.test(robots)) {
  errors.push('robots.txt must declare the canonical sitemap URL');
}

if (errors.length) {
  console.error('SEO SITEMAP AUDIT FAILED (' + errors.length + ' errors)');
  errors.forEach(error => console.error('- ' + error));
  process.exit(1);
}
console.log('SEO SITEMAP AUDIT PASS: ' + locations.length + ' unique canonical URLs; every URL resolves to a built page; robots.txt declares canonical sitemap.');
