import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const calculators = [
  'sip-calculator.html','compound-interest-calculator.html','mortgage-emi-calculator.html','roi-calculator.html','simple-interest-calculator.html','retirement-calculator.html','salary-to-hourly-calculator.html','profit-margin-calculator.html','fixed-deposit-calculator.html','recurring-deposit-calculator.html','lumpsum-calculator.html','cagr-calculator.html','car-loan-calculator.html','personal-loan-calculator.html','debt-payoff-calculator.html','inflation-calculator.html','net-worth-calculator.html','overtime-pay-calculator.html','freelance-rate-calculator.html','income-tax-scenario-calculator.html'
];
const guides = fs.existsSync(path.join(root,'articles'))
  ? fs.readdirSync(path.join(root,'articles')).filter(x => x.endsWith('.html'))
  : [];
const stale = ['step-up-sip-calculator.html','emergency-fund-calculator.html','real-return-calculator.html'];
const failures = [];
const warnings = [];

function read(file) { return fs.readFileSync(path.join(root,file),'utf8'); }
function count(re, text) { return (text.match(re) || []).length; }
function assert(ok, msg) { if (!ok) failures.push(msg); }

for (const file of calculators) {
  assert(fs.existsSync(path.join(root,file)), `missing calculator: ${file}`);
  if (!fs.existsSync(path.join(root,file))) continue;
  const html = read(file);
  assert(count(/<h1\b/gi, html) === 1, `${file}: expected exactly one H1`);
  assert(/<title>[^<]{20,180}<\/title>/i.test(html), `${file}: missing/weak title`);
  assert(/<meta[^>]+name=["']description["'][^>]+content=["'][^"']{80,200}["']/i.test(html), `${file}: missing/weak meta description`);
  assert(/<link[^>]+rel=["']canonical["'][^>]+href=["']https:\/\/wealtharrays\.com\//i.test(html), `${file}: missing canonical`);
  assert(/og:title|og:description|og:image/i.test(html), `${file}: missing social metadata`);
  assert(/BreadcrumbList/i.test(html), `${file}: missing BreadcrumbList JSON-LD`);
  assert(/WebApplication/i.test(html), `${file}: missing WebApplication JSON-LD`);
  assert(/phase3-seo\.js/i.test(html) || fs.existsSync(path.join(root,'phase3-seo.js')), `${file}: Phase 3 runtime not available`);
  for (const old of stale) assert(!html.includes(old), `${file}: stale retired URL ${old}`);
}

for (const file of guides) {
  const full = path.join('articles',file);
  const html = read(full);
  assert(count(/<h1\b/gi, html) === 1, `${full}: expected exactly one H1`);
  assert(/<title>[^<]{20,180}<\/title>/i.test(html), `${full}: missing/weak title`);
  assert(/<meta[^>]+name=["']description["'][^>]+content=["'][^"']{80,200}["']/i.test(html), `${full}: missing/weak meta description`);
  assert(/<link[^>]+rel=["']canonical["'][^>]+href=["']https:\/\/wealtharrays\.com\/articles\//i.test(html), `${full}: missing canonical`);
  assert(/BreadcrumbList/i.test(html), `${full}: missing BreadcrumbList JSON-LD`);
  assert(/Article/i.test(html), `${full}: missing Article JSON-LD`);
  const calculatorLinks = count(/href=["'][^"']*calculator[^"']*\.html["']/gi, html);
  if (calculatorLinks < 1) warnings.push(`${full}: no calculator link detected`);
  for (const old of stale) assert(!html.includes(old), `${full}: stale retired URL ${old}`);
}

const cats = ['category-investment.html','category-loan.html','category-banking.html','category-retirement.html','category-salary.html','category-business.html'];
for (const file of cats) {
  assert(fs.existsSync(path.join(root,file)), `missing category page: ${file}`);
  if (!fs.existsSync(path.join(root,file))) continue;
  const html = read(file);
  assert(count(/<h1\b/gi, html) === 1, `${file}: expected exactly one H1`);
  assert(/<link[^>]+rel=["']canonical["']/i.test(html), `${file}: missing canonical`);
  assert(/meta[^>]+name=["']description["']/i.test(html), `${file}: missing meta description`);
  assert(/phase3-seo\.js/i.test(html) || fs.existsSync(path.join(root,'phase3-seo.js')), `${file}: Phase 3 runtime not available`);
}

const sitemap = read('sitemap.xml');
assert(!stale.some(x => sitemap.includes(x)), 'sitemap contains retired calculator URL');
assert(sitemap.includes('https://wealtharrays.com/articles/'), 'sitemap is missing guide URLs');

const phase3 = read('phase3-seo.js');
assert(phase3.includes('Related calculators and guides'), 'Phase 3 runtime missing related-content module');
assert(phase3.includes('BreadcrumbList') || phase3.includes('Article'), 'Phase 3 runtime missing structured-data module');
assert(phase3.includes('og:title') && phase3.includes('twitter:card'), 'Phase 3 runtime missing social metadata module');
assert(phase3.includes('clusters'), 'Phase 3 runtime missing topic-cluster map');

if (warnings.length) console.log('Warnings:', ...warnings);
if (failures.length) {
  console.error(`Phase 3 SEO audit failed with ${failures.length} failure(s):`);
  for (const f of failures) console.error(` - ${f}`);
  process.exit(1);
}
console.log(`Phase 3 SEO audit passed: ${calculators.length} calculators, ${guides.length} guides, ${cats.length} category pages.`);
