import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=process.cwd();
const stamp=new Date().toISOString().slice(0,10).replaceAll('-','');
const siteSources=['wa-core.js','site-runtime.js','final-polish.js','wa-enhancements.js','theme-fix.js','phase3-seo.js','phase4-premium.js','homepage-search.js','calculator-search.js'];
const calcSources=['widget.js',...siteSources,'calculator-safety.js','calculator-page-init.js','calculator-enhancements.js','pdf-export-fix.js'];
const calculatorPages=['sip-calculator.html','compound-interest-calculator.html','mortgage-emi-calculator.html','roi-calculator.html','simple-interest-calculator.html','retirement-calculator.html','salary-to-hourly-calculator.html','profit-margin-calculator.html','fixed-deposit-calculator.html','recurring-deposit-calculator.html','lumpsum-calculator.html','cagr-calculator.html','car-loan-calculator.html','personal-loan-calculator.html','debt-payoff-calculator.html','inflation-calculator.html','net-worth-calculator.html','overtime-pay-calculator.html','freelance-rate-calculator.html','income-tax-scenario-calculator.html'];
const slugs=calculatorPages.map(x=>x.replace(/\.html$/,''));
const required=[...new Set([...siteSources,...calcSources,'calculators.js'])];
for(const f of required)if(!fs.existsSync(path.join(root,f)))throw new Error(`Missing runtime source: ${f}`);
function bundle(sources,label){const parts=sources.map(file=>{const body=fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n').trimEnd();const hash=crypto.createHash('sha256').update(body).digest('hex').slice(0,12);return `/* ===== WA CANONICAL MODULE | ${label} | ${file} | sha256:${hash} ===== */\n${body}\n`;});return `/* Wealth Arrays canonical ${label} runtime. Generated ${stamp}. */\n(function(){const k='__WA_CANONICAL_${label.toUpperCase()}_RUNTIME__';if(window[k])return;window[k]=true;})();\n${parts.join('\n')}`;}
fs.writeFileSync(path.join(root,'wa-site-runtime.js'),bundle(siteSources,'site'),'utf8');
fs.writeFileSync(path.join(root,'wa-calculator-runtime.js'),bundle(calcSources,'calculator'),'utf8');

const source=fs.readFileSync(path.join(root,'calculators.js'),'utf8');
const start=source.indexOf('const CALCULATORS = [');
const end=source.indexOf('\n];',start);
if(start<0||end<0)throw new Error('CALCULATORS definition list not found');
const body=source.slice(start+'const CALCULATORS = ['.length,end);
const objects=[];let depth=0,begin=-1,string=null,escaped=false;
for(let i=0;i<body.length;i++){const c=body[i];if(string){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c===string)string=null;continue}if(c==='"'||c==="'"||c==='`'){string=c;continue}if(c==='{'){if(depth===0)begin=i;depth++;continue}if(c==='}'){depth--;if(depth===0&&begin>=0){objects.push(body.slice(begin,i+1).trim());begin=-1}}}
if(objects.length!==20)throw new Error(`Expected 20 calculator definitions, found ${objects.length}`);
const definitions=objects.map(obj=>({obj,id:obj.match(/\bid:\s*["']([^"']+)["']/)?.[1],slug:obj.match(/\bslug:\s*["']([^"']+)["']/)?.[1]}));
if(definitions.some(x=>!x.id))throw new Error('Calculator definition has no id');
const bySlug=new Map(definitions.filter(x=>x.slug).map(x=>[x.slug,x.id]));
const byId=new Map(definitions.map(x=>[x.id,x.id]));
const pageAliases=new Map([['income-tax-scenario-calculator','income-tax-planner']]);
const defDir=path.join(root,'calculator-definitions');fs.mkdirSync(defDir,{recursive:true});
for(const {obj,id} of definitions)fs.writeFileSync(path.join(defDir,`${id}.js`),`/* Generated from calculators.js — do not edit directly. */\nwindow.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push(${obj});\n`,'utf8');

const allHtml=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory()){if(!['.git','node_modules'].includes(e.name))walk(f);}else if(e.name.endsWith('.html'))allHtml.push(f);}}walk(root);
const managed=new Set([...required,'wa-site-runtime.js','wa-calculator-runtime.js']);
for(const full of allHtml){let html=fs.readFileSync(full,'utf8');const isCalc=/<html[^>]+data-wa-calculator=/i.test(html);html=html.replace(/\s*<script\s+src=["']([^"']+)[^>]*><\/script>/gi,(tag,src)=>managed.has(path.basename(src.split('?',1)[0]))?'':tag);html=html.replace(/\s*<!-- WA-(?:SITE|CANONICAL)-RUNTIME:[^>]+-->\s*/g,'\n');
html=html.replace(/(<link\s+[^>]*rel=["'](?:preload|stylesheet)["'][^>]*href=["'])\/?styles\.css(["'][^>]*>)/gi,'$1/styles.css$2');html=html.replace(/(<link\s+[^>]*href=["'])styles\.css(["'][^>]*rel=["'](?:preload|stylesheet)["'][^>]*>)/gi,'$1/styles.css$2');if(!html.includes('href="/styles.css"')&&!html.includes("href='/styles.css'"))html=html.replace('</head>','<link rel="stylesheet" href="/styles.css"></head>');
html=html.replace(/\s*<link\s+[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*>/gi,'');
html=html.replace('</head>','<link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" type="image/png" sizes="48x48" href="/icon-192.png"><link rel="apple-touch-icon" sizes="180x180" href="/icon-512.png"></head>');
if(isCalc){const rawId=html.match(/data-wa-calculator="([^"]+)"/i)?.[1];if(!rawId)throw new Error(`Calculator page missing data-wa-calculator: ${full}`);const base=path.basename(full).toLowerCase()==='index.html'?path.basename(path.dirname(full)):path.basename(full,'.html');const id=byId.get(rawId)||bySlug.get(base)||pageAliases.get(base);if(!id)throw new Error(`No calculator definition matches ${full} (${rawId}, ${base})`);html=html.replace(/data-wa-calculator="[^"]+"/i,`data-wa-calculator="${id}"`);html=html.replace(/\s*<script[^>]+calculator-definitions[^>]*><\/script>/gi,'');const def=`<script src="/calculator-definitions/${id}.js?v=${stamp}" defer></script>`;const runtime=`<script src="/wa-calculator-runtime.js?v=${stamp}" defer></script>`;html=html.replace(/\s*<script[^>]+wa-calculator-runtime\.js[^>]*><\/script>/gi,'');html=html.replace('</body>',`${def}${runtime}</body>`);html=html.replace(/(<body[^>]*>)/i,'$1\n<!-- WA-CANONICAL-RUNTIME:v3 -->');}
else{if(!html.includes('wa-site-runtime.js'))html=html.replace('</body>',`<script src="/wa-site-runtime.js?v=${stamp}" defer></script></body>`);html=html.replace(/(<body[^>]*>)/i,'$1\n<!-- WA-SITE-RUNTIME:v3 -->');}
if(!html.includes('/cls-fixes.css'))html=html.replace('</head>','<link rel="stylesheet" href="/cls-fixes.css?v=20260917" media="all"></head>');fs.writeFileSync(full,html,'utf8');}

const routes=['/','/tools','/articles','/faq','/about','/contact','/privacy','/terms','/disclaimer','/methodology','/editorial-policy','/advertising-policy','/category-investment','/category-loan','/category-banking','/category-retirement','/category-salary','/category-business',...slugs.map(s=>`/${s}/`)];for(const full of allHtml){const rel=path.relative(root,full).replaceAll(path.sep,'/');if(/^articles\/[^/]+\.html$/.test(rel))routes.push('/'+rel.replace(/\.html$/,''));}
const unique=[...new Set(routes)];const today=new Date().toISOString().slice(0,10);const sitemap=['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',...unique.map(u=>`  <url><loc>https://wealtharrays.com${u}</loc><lastmod>${today}</lastmod></url>`),'</urlset>',''].join('\n');fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap,'utf8');console.log(`Root-cause build complete: canonical site search, calculator search, current favicon, 20 split definitions, normalized calculator IDs, legacy route aliases, nested route support, absolute styles, CLS reservation, deterministic sitemap, ${allHtml.length} HTML files normalized.`);