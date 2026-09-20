import fs from 'node:fs';
import path from 'node:path';

const calculators=['sip-calculator.html','compound-interest-calculator.html','mortgage-emi-calculator.html','roi-calculator.html','simple-interest-calculator.html','retirement-calculator.html','salary-to-hourly-calculator.html','profit-margin-calculator.html','fixed-deposit-calculator.html','recurring-deposit-calculator.html','lumpsum-calculator.html','cagr-calculator.html','car-loan-calculator.html','personal-loan-calculator.html','debt-payoff-calculator.html','inflation-calculator.html','net-worth-calculator.html','overtime-pay-calculator.html','freelance-rate-calculator.html','income-tax-scenario-calculator.html'];
for(const page of calculators){
 const html=fs.readFileSync(page,'utf8');
 const runtime=(html.match(/wa-calculator-runtime\.js\?v=[^"']+/g)||[]);
 if(runtime.length!==1)throw new Error(`${page}: expected exactly one versioned calculator runtime`);
 if(html.includes('calculators.js'))throw new Error(`${page}: calculators.js must never be page-loaded`);
 if(!html.includes('calculator-definitions/'))throw new Error(`${page}: split definition missing`);
 if(!html.includes('/cls-fixes.css?v='))throw new Error(`${page}: CLS stylesheet missing`);
 if(!html.includes('"@type":"WebApplication"')&&!html.includes('"@type": "WebApplication"'))throw new Error(`${page}: WebApplication schema missing`);
 if(!html.includes('"@type":"FAQPage"')&&!html.includes('"@type": "FAQPage"'))throw new Error(`${page}: FAQPage schema missing`);
 if(!/<link[^>]+rel=["']canonical["'][^>]+https:\/\/wealtharrays\.com\/[^"']+\//i.test(html))throw new Error(`${page}: calculator canonical URL must use slash route`);
 if(!html.includes('href="/favicon.svg"'))throw new Error(`${page}: canonical SVG favicon missing`);
 if(!html.includes('sizes="48x48"')||!html.includes('href="/icon-192.png"'))throw new Error(`${page}: 48x48 PNG favicon fallback missing`);
 if(!html.includes('sizes="180x180"')||!html.includes('href="/icon-512.png"'))throw new Error(`${page}: Apple touch icon missing`);
}
const guides=fs.readdirSync('articles').filter(x=>x.endsWith('.html'));
for(const file of guides){const html=fs.readFileSync(path.join('articles',file),'utf8');if(!html.includes('"@type":"Article"')&&!html.includes('"@type": "Article"'))throw new Error(`${file}: Article schema missing`);if(!html.includes('/cls-fixes.css?v='))throw new Error(`${file}: CLS stylesheet missing`);if(!/<h1\b/i.test(html))throw new Error(`${file}: H1 missing`);}
const home=fs.readFileSync('index.html','utf8');if(!home.includes('id="tool-search-results"'))throw new Error('Homepage search results container missing');if(!home.includes('href="/favicon.svg"'))throw new Error('Homepage canonical favicon missing');
const styles=fs.readFileSync('styles.css','utf8');if(!/\.search-bar\{[^}]*position:relative/i.test(styles)&&!styles.includes('.search-bar{position:relative'))throw new Error('Homepage search parent must be positioned');if(!styles.includes('z-index:1000'))throw new Error('Homepage search parent z-index missing');
const calcSearch=fs.readFileSync('calculator-search.js','utf8');for(const needle of ['toLowerCase().trim()','addEventListener(\'input\'','k=normalize(c[3])','s=normalize(c[1])'])if(!calcSearch.includes(needle))throw new Error(`Calculator search regression missing: ${needle}`);if(!calcSearch.includes('new MutationObserver'))throw new Error('Calculator search must recover when widget markup mounts late');if(!/setTimeout\(install,\s*(?:ms|2500)/.test(calcSearch))throw new Error('Calculator search retry window missing');
const enhancement=fs.readFileSync('calculator-enhancements.js','utf8');if(!/new URL\('\/icon-512\.png',(?:window\.location|location)\.origin\)\.href/.test(enhancement))throw new Error('PDF export must use current icon-512.png');if(!enhancement.includes('alt="Wealth Arrays logo"'))throw new Error('PDF report logo element missing');
const hotfix=fs.readFileSync('production-hotfix.js','utf8');if(!hotfix.includes('__WA_PRODUCTION_HOTFIX__'))throw new Error('Production hotfix guard missing');if(!hotfix.includes("#currency-select"))throw new Error('Header dedupe hotfix missing');if(!hotfix.includes("calculator-search.js"))throw new Error('Calculator search hotfix loader missing');if(!hotfix.includes("pdf-export-fix.js"))throw new Error('PDF hotfix loader missing');
const themeInit=fs.readFileSync('theme-init.js','utf8');if(!themeInit.includes('/production-hotfix.js?v=20260918'))throw new Error('Theme bootstrap must load production hotfix');
const favicon=fs.readFileSync('favicon.svg','utf8');if(!favicon.includes('width="512"')||!favicon.includes('height="512"')||!favicon.includes('viewBox="0 0 512 512"'))throw new Error('favicon.svg must declare a 512x512 viewBox and dimensions');
const sitemap=fs.readFileSync('sitemap.xml','utf8');if(!sitemap.includes('<urlset'))throw new Error('Sitemap root missing');if(sitemap.includes('calculator.html</loc>'))throw new Error('Legacy calculator URL leaked into sitemap');if(!sitemap.includes('/sip-calculator/</loc>'))throw new Error('Canonical calculator route missing from sitemap');
const redirects=fs.readFileSync('_redirects','utf8');for(const slug of calculators.map(x=>x.replace('.html','')))if(!redirects.includes(`/${slug} /${slug}/ 301`))throw new Error(`Missing slash redirect: ${slug}`);
for(const [legacy,target] of [['/p/building-corporate-personal-cash.html','/category-business'],['/p/optimizing-fixed-term-certificates.html','/fixed-deposit-calculator/'],['/p/the-ultimate-guide-to-systematic.html','/articles/sip-calculator-guide']])if(!redirects.includes(`${legacy} ${target} 301`))throw new Error(`Missing legacy /p redirect: ${legacy}`);
const widget=fs.readFileSync('widget.html','utf8');if(!widget.includes('typeof CALCULATORS !== "undefined"'))throw new Error('Widget must resolve calculator definitions without relying on window.CALCULATORS');
const runtime=fs.readFileSync('wa-calculator-runtime.js','utf8');if(runtime.includes('WA CANONICAL MODULE | calculator | calculators.js'))throw new Error('All 20 definitions are still bundled');
console.log(`Root-cause audit PASS — ${calculators.length} calculators, ${guides.length} guides, search stacking/matching, current PDF branding, production hotfix, favicon metadata, schemas, canonical routes and generated sitemap verified.`);
