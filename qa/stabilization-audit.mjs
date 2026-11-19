import fs from 'node:fs';
import path from 'node:path';

const calculators = [
  'sip-calculator/index.html','compound-interest-calculator/index.html','mortgage-emi-calculator/index.html','roi-calculator/index.html','simple-interest-calculator/index.html','retirement-calculator/index.html','salary-to-hourly-calculator/index.html','profit-margin-calculator/index.html','fixed-deposit-calculator/index.html','recurring-deposit-calculator/index.html','lumpsum-calculator/index.html','cagr-calculator/index.html','car-loan-calculator/index.html','personal-loan-calculator/index.html','debt-payoff-calculator/index.html','inflation-calculator/index.html','net-worth-calculator/index.html','overtime-pay-calculator/index.html','freelance-rate-calculator/index.html','income-tax-scenario-calculator/index.html'
];
const runtimeSources = ['wa-core.js','site-runtime.js','final-polish.js','theme-fix.js','phase3-seo.js','calculator-page-init.js','phase4-premium.js','widget.js','widget-bootstrap.js','calculator-safety.js','pdf-export-fix.js'];
for (const file of runtimeSources) if (!fs.existsSync(file)) throw new Error(`Missing runtime source: ${file}`);
if (fs.existsSync('calculator-runtime.js')) throw new Error('Retired calculator-runtime.js must not exist');
if (!fs.existsSync('wa-calculator-runtime.js')) throw new Error('Missing canonical bundle');
if (!fs.existsSync('wa-article-runtime.js')) throw new Error('Missing lightweight article bundle');
const bundle = fs.readFileSync('wa-calculator-runtime.js','utf8');
const articleBundle = fs.readFileSync('wa-article-runtime.js','utf8');
if (!articleBundle.includes('WA CANONICAL MODULE')) throw new Error('Article bundle provenance markers missing');
for (const file of fs.readdirSync('articles').filter(name=>name.endsWith('.html'))) { const html=fs.readFileSync(path.join('articles',file),'utf8'); const tags=[...html.matchAll(/<script\\s+src=["']([^"']+)[^>]*><\\/script>/gi)].map(m=>path.basename(m[1].split('?')[0])); if(tags.filter(name=>name==='wa-article-runtime.js').length!==1||tags.includes('wa-site-runtime.js')) throw new Error(file+': article runtime is not isolated'); }
if (!bundle.includes('WA CANONICAL MODULE')) throw new Error('Bundle provenance markers missing');
for (const file of calculators) {
  if (!fs.existsSync(file)) throw new Error(`Missing calculator page: ${file}`);
  const html = fs.readFileSync(file,'utf8');
  const tags = [...html.matchAll(/<script\s+src=["']([^"']+)[^>]*><\/script>/gi)].map(m=>path.basename(m[1].split('?')[0]));
  if (tags.filter(x=>x==='wa-calculator-runtime.js').length !== 1) throw new Error(`${file}: canonical bundle count is not 1`);
  if (tags.includes('calculator-runtime.js')) throw new Error(`${file}: retired calculator runtime still loaded`);
  for (const name of runtimeSources) if (tags.includes(name)) throw new Error(`${file}: runtime source ${name} still loaded directly`);
  const definitionMatch=html.match(/(?:src|href)=["'](?:[^"']*\/)?calculator-definitions\/([^"'?]+)\.js(?:\?[^"']*)?["']/i);
  if (!definitionMatch || !fs.existsSync(`calculator-definitions/${definitionMatch[1]}.js`)) throw new Error(`${file}: split calculator definition missing`);
  // The publisher ID belongs in the subscription-aware loader, not a static page tag.
  // These routes are intentionally excluded from AdSense by Phase 4 policy.
  const adExemptPages = new Set(['income-tax-scenario-calculator/index.html','loan-emi-calculator/index.html','loan-interest-calculator/index.html']);
  const adLoaderTags = html.match(/<script\b(?=[^>]*src=["']\/wa-ad-loader\.js(?:\?[^"']*)?["'])[^>]*>\s*<\/script>/gi) || [];
  const directAdTags = html.match(/<script\b(?=[^>]*src=["']https:\/\/pagead2?\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js)[^>]*>/gi) || [];
  const adLoaderSource = fs.existsSync('wa-ad-loader.js') ? fs.readFileSync('wa-ad-loader.js','utf8') : '';
  if (!adExemptPages.has(file) && adLoaderTags.length !== 1) throw new Error(`${file}: expected exactly one subscription-aware AdSense loader, found ${adLoaderTags.length}`);
  if (!adExemptPages.has(file) && !adLoaderSource.includes('ca-pub-6507600103785450')) throw new Error(`${file}: AdSense publisher id missing from wa-ad-loader.js`);
  if (directAdTags.length) throw new Error(`${file}: direct AdSense bootstrap bypasses the subscription-aware loader`);
  if (!html.includes('rel="canonical"')) throw new Error(`${file}: canonical tag missing`);
}
if (!fs.existsSync('ads.txt') || !fs.readFileSync('ads.txt','utf8').includes('google.com, pub-6507600103785450, DIRECT')) throw new Error('ads.txt authorization missing');
if (fs.existsSync('node_modules')) throw new Error('node_modules must not be present in deploy tree');
console.log(`Stabilization audit PASS — ${calculators.length} calculators use exactly one shared runtime plus one page-specific definition; retired runtime is absent; source modules are not page-loaded directly; AdSense and ads.txt contracts preserved.`);
