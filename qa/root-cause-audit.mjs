import fs from 'node:fs';
import path from 'node:path';

const calculators=['sip-calculator/index.html','compound-interest-calculator/index.html','mortgage-emi-calculator/index.html','roi-calculator/index.html','simple-interest-calculator/index.html','retirement-calculator/index.html','salary-to-hourly-calculator/index.html','profit-margin-calculator/index.html','fixed-deposit-calculator/index.html','recurring-deposit-calculator/index.html','lumpsum-calculator/index.html','cagr-calculator/index.html','car-loan-calculator/index.html','personal-loan-calculator/index.html','debt-payoff-calculator/index.html','inflation-calculator/index.html','net-worth-calculator/index.html','overtime-pay-calculator/index.html','freelance-rate-calculator/index.html','income-tax-scenario-calculator/index.html'];
for(const page of calculators){
 const html=fs.readFileSync(page,'utf8');
 const runtime=(html.match(/wa-calculator-runtime\.js\?v=[^"']+/g)||[]);
 if(runtime.length!==1)throw new Error(`${page}: expected exactly one versioned calculator runtime`);
 if(html.includes('calculators.js'))throw new Error(`${page}: calculators.js must never be page-loaded`);
 if(!html.includes('calculator-definitions/'))throw new Error(`${page}: split definition missing`);
 if(!html.includes('/cls-fixes.css?v='))throw new Error(`${page}: CLS stylesheet missing`);
 const schemaBlocks=[...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(match=>JSON.parse(match[1]));
 const schemaTypes=[];
 const collectTypes=node=>{if(!node||typeof node!=='object')return;if(typeof node['@type']==='string')schemaTypes.push(node['@type']);if(Array.isArray(node['@graph']))node['@graph'].forEach(collectTypes);};
 schemaBlocks.forEach(collectTypes);
 if(schemaTypes.filter(type=>type==='SoftwareApplication').length!==1)throw new Error(`${page}: expected exactly one SoftwareApplication entity`);
 if(schemaTypes.filter(type=>type==='BreadcrumbList').length!==1)throw new Error(`${page}: expected exactly one BreadcrumbList entity`);
 if(schemaTypes.includes('WebApplication'))throw new Error(`${page}: legacy duplicate WebApplication entity remains`);
 if(html.includes('"@type":"FAQPage"')||html.includes('"@type": "FAQPage"'))throw new Error(`${page}: mismatched FAQPage schema must remain omitted until generated from visible FAQs`);
 if(!/<h2>Frequently asked questions<\/h2>/i.test(html))throw new Error(`${page}: visible FAQ heading missing`);
 if((html.match(/class=["']faq-item["']/gi)||[]).length<2)throw new Error(`${page}: too few visible FAQ items`);
 if(!/class=["'][^"']*wa-skip-link/i.test(html))throw new Error(`${page}: static skip link missing`);
 if(!/property=["']og:title["']/i.test(html))throw new Error(`${page}: og:title missing`);
 if(!/name=["']twitter:card["']/i.test(html))throw new Error(`${page}: twitter:card missing`);
 if(!/<link[^>]+rel=["']canonical["'][^>]+https:\/\/wealtharrays\.com\/[^"']+\//i.test(html))throw new Error(`${page}: calculator canonical URL must use slash route`);
 if(!html.includes('href="/favicon.svg"'))throw new Error(`${page}: canonical SVG favicon missing`);
 if(!html.includes('sizes="48x48"')||!html.includes('href="/icon-192.png"'))throw new Error(`${page}: 48x48 PNG favicon fallback missing`);
 if(!html.includes('sizes="180x180"')||!html.includes('href="/icon-512.png"'))throw new Error(`${page}: Apple touch icon missing`);
}
const notFoundHtml=fs.readFileSync('404.html','utf8');
const notFoundPreloads=(notFoundHtml.match(/<link\b(?=[^>]*rel=["']preload["'])(?=[^>]*href=["']\/styles\.css(?:\?[^"']*)?["'])[^>]*>/gi)||[]).length;
const notFoundStylesheets=(notFoundHtml.match(/<link\b(?=[^>]*rel=["']stylesheet["'])(?=[^>]*href=["']\/styles\.css(?:\?[^"']*)?["'])[^>]*>/gi)||[]).length;
if(notFoundPreloads!==1||notFoundStylesheets!==1)throw new Error(`404.html: expected one stylesheet preload and one stylesheet, found ${notFoundPreloads} and ${notFoundStylesheets}`);
const guides=fs.readdirSync('articles').filter(x=>x.endsWith('.html'));
for(const file of guides){const html=fs.readFileSync(path.join('articles',file),'utf8');if(!html.includes('"@type":"Article"')&&!html.includes('"@type": "Article"'))throw new Error(`${file}: Article schema missing`);if(!html.includes('/cls-fixes.css?v='))throw new Error(`${file}: CLS stylesheet missing`);if(!/<h1\b/i.test(html))throw new Error(`${file}: H1 missing`);}
const allSiteHtml=[];function walkHtml(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.name==='.git'||e.name==='node_modules')continue;const p=path.join(dir,e.name);if(e.isDirectory())walkHtml(p);else if(e.name.endsWith('.html'))allSiteHtml.push(p)}}walkHtml('.');
for(const file of allSiteHtml){
 const html=fs.readFileSync(file,'utf8');
 if(/href=["']{2}/.test(html))throw new Error(`${file}: empty href target remains`);
 if(/<main\b/i.test(html)&&!/<a\b[^>]*class=["'][^"']*wa-skip-link/i.test(html))throw new Error(`${file}: static skip link missing`);
 if(!/property=["']og:title["']/i.test(html))throw new Error(`${file}: og:title missing`);
 if(!/name=["']twitter:card["']/i.test(html))throw new Error(`${file}: twitter:card missing`);
}
const socialHtml=fs.readFileSync('index.html','utf8');if(!socialHtml.includes('https://wealtharrays.com/og-image.png')||!socialHtml.includes('image/png'))throw new Error('Social preview must use the 1200x630 PNG asset and MIME type');
const privacyHtml=fs.readFileSync('privacy.html','utf8');if(/does not serve Google AdSense advertisements/i.test(privacyHtml))throw new Error('privacy.html contains stale AdSense disclosure');
const home=fs.readFileSync('index.html','utf8');if(!home.includes('id="tool-search-results"'))throw new Error('Homepage search results container missing');if(!home.includes('href="/favicon.svg"'))throw new Error('Homepage canonical favicon missing');
const styles=fs.readFileSync('styles.css','utf8');if(!/\.search-bar\{[^}]*position:relative/i.test(styles)&&!styles.includes('.search-bar{position:relative'))throw new Error('Homepage search parent must be positioned');if(!styles.includes('z-index:1000'))throw new Error('Homepage search parent z-index missing');
const calcSearch=fs.readFileSync('calculator-search.js','utf8');for(const needle of ['toLowerCase().trim()','addEventListener(\'input\'','k=normalize(c[3])','s=normalize(c[1])'])if(!calcSearch.includes(needle))throw new Error(`Calculator search regression missing: ${needle}`);if(calcSearch.includes('MutationObserver')||calcSearch.includes('setTimeout(install'))throw new Error('Static tools search must not poll or observe DOM mutations');
if(fs.existsSync('calculator-enhancements.js'))throw new Error('Unused duplicate calculator enhancement module must remain retired');
if(fs.existsSync('production-hotfix.js'))throw new Error('Retired production hotfix loader must not be shipped');
const phase4=fs.readFileSync('phase4-premium.js','utf8');if(phase4.includes('MutationObserver')||phase4.includes('dedupeSharedControls'))throw new Error('Phase 4 must not observe body mutations or dedupe shared controls');
const visualRuntime=fs.readFileSync('site-runtime.js','utf8');if(visualRuntime.includes('MutationObserver')||visualRuntime.includes('adsbygoogle.js')||visualRuntime.includes("addEventListener('resize'"))throw new Error('Visual runtime must not observe body mutations, load AdSense or read layout on resize');
const finalPolish=fs.readFileSync('final-polish.js','utf8');if(finalPolish.includes('MutationObserver')||finalPolish.includes("host.innerHTML=''")||finalPolish.includes("addEventListener('scroll'"))throw new Error('Final polish must not remount calculator DOM or observe/search-layout on scroll');
const themeInit=fs.readFileSync('theme-init.js','utf8');if(themeInit.length>1024||themeInit.includes('production-hotfix')||themeInit.includes('pauseAdRequests'))throw new Error('Theme bootstrap must remain a sub-1 KB theme-only script');
const toolsHtml=fs.readFileSync('tools.html','utf8');if(!toolsHtml.includes('/calculator-search.js'))throw new Error('Tools page must own its search module directly');
const favicon=fs.readFileSync('favicon.svg','utf8');if(!favicon.includes('width="512"')||!favicon.includes('height="512"')||!favicon.includes('viewBox="0 0 512 512"'))throw new Error('favicon.svg must declare a 512x512 viewBox and dimensions');
const sitemap=fs.readFileSync('sitemap.xml','utf8');if(!sitemap.includes('<urlset'))throw new Error('Sitemap root missing');if(sitemap.includes('calculator.html</loc>'))throw new Error('Legacy calculator URL leaked into sitemap');if(!sitemap.includes('/sip-calculator/</loc>'))throw new Error('Canonical calculator route missing from sitemap');if(!sitemap.includes('https://wealtharrays.com/research</loc>'))throw new Error('Research hub missing from sitemap');
const redirects=fs.readFileSync('_redirects','utf8');for(const slug of calculators.map(x=>x.replace(/\/index\.html$/,'').replace(/\.html$/,''))){const target=slug==='income-tax-scenario-calculator'?'income-tax-planner':slug;if(!redirects.includes(`/${slug} /${target}/ 301`))throw new Error(`Missing canonical slash redirect: /${slug} -> /${target}/`);}
if(!fs.existsSync('terms-and-conditions.html'))throw new Error('Legacy terms URL file missing');
if(!fs.existsSync('p/README.md'))throw new Error('Legacy /p namespace marker missing; ZIP exports would omit the directory');
for(const [legacy,target] of [['/p/building-corporate-personal-cash.html','/category-business.html'],['/p/optimizing-fixed-term-certificates.html','/fixed-deposit-calculator/'],['/p/the-ultimate-guide-to-systematic.html','/articles/sip-calculator-guide.html']])if(!redirects.includes(`${legacy} ${target} 301`))throw new Error(`Missing hardened legacy /p redirect: ${legacy}`);
const widget=fs.readFileSync('widget.html','utf8');if(!widget.includes('/calculators.js')||!widget.includes('/wa-calculator-runtime.js'))throw new Error('Widget must load calculator definitions and canonical runtime');
const runtime=fs.readFileSync('wa-calculator-runtime.js','utf8');if(runtime.includes('WA CANONICAL MODULE | calculator | calculators.js'))throw new Error('All 20 definitions are still bundled');
console.log(`Root-cause audit PASS — ${calculators.length} calculators, ${guides.length} guides, search stacking/matching, current PDF branding, production hotfix, favicon metadata, schemas, canonical routes and generated sitemap verified.`);
