import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const siteSources = ['wa-core.js','site-runtime.js','final-polish.js','wa-enhancements.js','theme-fix.js','phase2-intelligence.js','phase2-retirement.js','phase3-seo.js','phase4-premium.js'];
const calculatorSources = ['calculators.js','widget.js',...siteSources,'calculator-page-init.js','calculator-enhancements.js'];
const calculatorPages = ['sip-calculator.html','compound-interest-calculator.html','mortgage-emi-calculator.html','roi-calculator.html','simple-interest-calculator.html','retirement-calculator.html','salary-to-hourly-calculator.html','profit-margin-calculator.html','fixed-deposit-calculator.html','recurring-deposit-calculator.html','lumpsum-calculator.html','cagr-calculator.html','car-loan-calculator.html','personal-loan-calculator.html','debt-payoff-calculator.html','inflation-calculator.html','net-worth-calculator.html','overtime-pay-calculator.html','freelance-rate-calculator.html','income-tax-scenario-calculator.html'];
const calculatorSlugs = calculatorPages.map(file=>file.replace(/\.html$/,''));
for(const file of [...new Set(calculatorSources)]) if(!fs.existsSync(path.join(root,file))) throw new Error(`Missing canonical runtime source: ${file}`);
const stamp=new Date().toISOString().slice(0,10).replaceAll('-','');
const buildBundle=(sources,label)=>{const sourceParts=sources.map(file=>{const content=fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n').trimEnd();const sha=crypto.createHash('sha256').update(content).digest('hex').slice(0,12);return `/* ===== WA CANONICAL MODULE | ${label} | ${file} | sha256:${sha} ===== */\n${content}\n`;});return `/* Wealth Arrays canonical ${label} runtime bundle.\n * Generated from CURRENT main sources by scripts/phase-stabilization-build.mjs.\n * Build date: ${stamp}\n */\n(function(){\n  const key = ${JSON.stringify(`__WA_CANONICAL_${label.toUpperCase()}_RUNTIME_BUNDLE__`)};\n  if (window[key]) return;\n  window[key] = true;\n})();\n\n${sourceParts.join('\n')}`;};
fs.writeFileSync(path.join(root,'wa-site-runtime.js'),buildBundle(siteSources,'site'),'utf8');
fs.writeFileSync(path.join(root,'wa-calculator-runtime.js'),buildBundle(calculatorSources,'calculator'),'utf8');
const stylesPath=path.join(root,'styles.css');
if(fs.existsSync(stylesPath)){const beforeStyles=fs.readFileSync(stylesPath,'utf8');const afterStyles=beforeStyles.replace(/(\.ledger-hero\s*\{[^}]*?)overflow\s*:\s*hidden\s*;([^}]*\})/gi,'$1$2');if(afterStyles!==beforeStyles) fs.writeFileSync(stylesPath,afterStyles,'utf8');}
const managedBasenames=new Set(calculatorSources);const siteManagedBasenames=new Set(siteSources);let changed=0;
for(const file of calculatorPages){const full=path.join(root,file);if(!fs.existsSync(full)) throw new Error(`Missing calculator page: ${file}`);let html=fs.readFileSync(full,'utf8');const before=html;html=html.replace(/\s*<script\s+src=["']([^"']+)["'][^>]*><\/script>/gi,(tag,src)=>{const base=path.basename(src.split('?',1)[0]);return managedBasenames.has(base)||base==='wa-calculator-runtime.js'?'':tag;});const canonicalTag='<script src="/wa-calculator-runtime.js?v=20260917-stable" defer></script>';html=html.replace(/\s*<!-- WA-CANONICAL-RUNTIME:[^>]+-->\s*/g,'\n');if(!html.includes(canonicalTag)) html=html.replace('</body>',`${canonicalTag}</body>`);html=html.replace(/(<body[^>]*>)/i,'$1\n<!-- WA-CANONICAL-RUNTIME:v1 -->');if(html!==before){fs.writeFileSync(full,html,'utf8');changed++;}}
const htmlFiles=[];const walk=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory()){if(!['.git','node_modules'].includes(entry.name)) walk(full);}else if(/\.html$/i.test(entry.name)) htmlFiles.push(full);}};walk(root);
for(const full of htmlFiles){const rel=path.relative(root,full).replaceAll(path.sep,'/');if(calculatorPages.includes(rel)||rel==='404.html'||calculatorSlugs.some(slug=>rel===`${slug}/index.html`)) continue;let html=fs.readFileSync(full,'utf8');const before=html;const hasShared=siteSources.some(base=>html.includes(base));const hasSiteBundle=html.includes('wa-site-runtime.js');if(!hasShared&&!hasSiteBundle) continue;html=html.replace(/\s*<script\s+src=["']([^"']+)["'][^>]*><\/script>/gi,(tag,src)=>{const base=path.basename(src.split('?',1)[0]);return siteManagedBasenames.has(base)||base==='wa-site-runtime.js'?'':tag;});const canonicalTag='<script src="/wa-site-runtime.js?v=20260917-stable" defer></script>';if(!html.includes('wa-site-runtime.js')) html=html.replace('</body>',`${canonicalTag}</body>`);html=html.replace(/\s*<!-- WA-SITE-RUNTIME:[^>]+-->\s*/g,'\n');html=html.replace(/(<body[^>]*>)/i,'$1\n<!-- WA-SITE-RUNTIME:v1 -->');if(html!==before){fs.writeFileSync(full,html,'utf8');changed++;}}

// Canonical public URLs use slash routes for calculators.
const normalizePublicUrls=html=>{
  let out=html.replace(/https:\/\/wealtharrays\.com\/([^\s"'<>]+?)\.html(?=[\s"'<>#?])/g,(_,p)=>`https://wealtharrays.com/${p}`);
  for(const slug of calculatorSlugs){
    const escaped=slug.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    out=out.replace(new RegExp(`(https:\\/\\/wealtharrays\\.com\\/)${escaped}(?=["'<>#?\\s])`,'g'),`$1${slug}/`);
    out=out.replace(new RegExp(`(href=["'])(?:\\/)??${escaped}(?=["'#?])`,'gi'),`$1${slug}/`);
  }
  out=out.replace(/(href=["'][^"']*?)index\.html(["'])/gi,'$1$2').replace(/(href=["'][^"']*?)\.html(["'])/gi,'$1$2');
  return out;
};
for(const full of htmlFiles){let html=fs.readFileSync(full,'utf8');const normalized=normalizePublicUrls(html);if(normalized!==html){fs.writeFileSync(full,normalized,'utf8');changed++;}}
const sitemapPath=path.join(root,'sitemap.xml');
if(fs.existsSync(sitemapPath)){let sitemap=fs.readFileSync(sitemapPath,'utf8').replace(/https:\/\/wealtharrays\.com\/([^<]+?)\.html<\/loc>/g,(_,p)=>`https://wealtharrays.com/${p}</loc>`);for(const slug of calculatorSlugs)sitemap=sitemap.replace(new RegExp(`https:\/\/wealtharrays\\.com\\/${slug}(?=<\\/loc>)`,'g'),`https://wealtharrays.com/${slug}/`);fs.writeFileSync(sitemapPath,sitemap,'utf8');}

// Generate clean calculator slash routes from the canonical source pages. The root .html files remain
// as legacy redirect targets; only /calculator-slug/ is exposed as the canonical public page.
for(const file of calculatorPages){const slug=file.replace(/\.html$/,'');const source=path.join(root,file);const dir=path.join(root,slug);const target=path.join(dir,'index.html');fs.mkdirSync(dir,{recursive:true});let html=fs.readFileSync(source,'utf8');html=normalizePublicUrls(html);if(!/<base\s+href=["']\/["']/i.test(html))html=html.replace(/<head>/i,'<head>\n<base href="/">');html=html.replace(new RegExp(`https:\/\/wealtharrays\\.com\\/${slug}(?!\\/)`,'g'),`https://wealtharrays.com/${slug}/`);fs.writeFileSync(target,html,'utf8');}

if(fs.existsSync(path.join(root,'node_modules'))) fs.rmSync(path.join(root,'node_modules'),{recursive:true,force:true});
const gitignore=path.join(root,'.gitignore');let ignore=fs.existsSync(gitignore)?fs.readFileSync(gitignore,'utf8'):'';for(const item of ['node_modules/','.DS_Store']) if(!ignore.split(/\r?\n/).includes(item)) ignore+=`${ignore.endsWith('\n')||!ignore?'':'\n'}${item}\n`;fs.writeFileSync(gitignore,ignore,'utf8');
console.log(`Stabilization build complete — canonical bundles, calculator slash routes, exports/schema, and URL normalization generated; ${changed} existing files normalized.`);
