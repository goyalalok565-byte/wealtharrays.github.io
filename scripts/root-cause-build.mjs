import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=process.cwd();
const stamp=new Date().toISOString().replace(/\D/g,'').slice(0,14);
const siteSources=['wa-core.js','site-runtime.js','final-polish.js','theme-fix.js','phase3-seo.js','phase4-premium.js','homepage-search.js','calculator-search.js'];
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
const managed=new Set([...required,'wa-site-runtime.js','wa-calculator-runtime.js','financial-engine.js','decision-adapters.js','scenario-lab.js','goal-planner.js','financial-workspace.js','report-engine.js','formula-registry.js','i18n.js','accessibility.js','analytics.js','visualization.js']);
const isScenarioLabPage=(rel)=>rel==='scenario-lab.html';
const isGoalPlannerPage=(rel)=>rel==='goal-planner.html';
const isWorkspacePage=(rel)=>rel==='financial-workspace.html';
for(const full of allHtml){
  let html=fs.readFileSync(full,'utf8');
  // Normalize legacy empty navigation targets at source/build level so future generated pages never emit dead self-links.
  html=html.replace(/href=[\"']{2}/g, 'href="/"');
  const relPath=path.relative(root,full).replaceAll(path.sep,'/');
  const isWidget=relPath==='widget.html'||relPath==='widget/index.html';
  const isScenarioLab=isScenarioLabPage(relPath);
  const isGoalPlanner=isGoalPlannerPage(relPath);
  const isCalc=/<html[^>]+data-wa-calculator=/i.test(html);
  html=html.replace(/\s*<script\s+src=["']([^"']+)[^>]*><\/script>/gi,(tag,src)=>{
    const base=path.basename(src.split('?',1)[0]);
    const keep=managed.has(base)||(isWidget&&['calculators.js','wa-calculator-runtime.js'].includes(base))||(isScenarioLab&&['financial-engine.js','decision-adapters.js','scenario-lab.js'].includes(base))||(isGoalPlanner&&['financial-engine.js','decision-adapters.js','goal-planner.js'].includes(base))||(isWorkspacePage&&['financial-engine.js','report-engine.js','financial-workspace.js'].includes(base));
    return keep?'':tag;
  });html=html.replace(/\s*<!-- WA-(?:SITE|CANONICAL)-RUNTIME:[^>]+-->\s*/g,'\n');
html=html.replace(/(<link\s+[^>]*rel=["'](?:preload|stylesheet)["'][^>]*href=["'])\/?styles\.css(["'][^>]*>)/gi,'$1/styles.css$2');html=html.replace(/(<link\s+[^>]*href=["'])styles\.css(["'][^>]*rel=["'](?:preload|stylesheet)["'][^>]*>)/gi,'$1/styles.css$2');if(!html.includes('href="/styles.css"')&&!html.includes("href='/styles.css'"))html=html.replace('</head>','<link rel="stylesheet" href="/styles.css"></head>');
html=html.replace(/\s*<link\s+[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*>/gi,'');
html=html.replace('</head>','<link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" type="image/png" sizes="48x48" href="/icon-192.png"><link rel="apple-touch-icon" sizes="180x180" href="/icon-512.png"></head>');
if(isCalc){const rawId=html.match(/data-wa-calculator="([^"]+)"/i)?.[1];if(!rawId)throw new Error(`Calculator page missing data-wa-calculator: ${full}`);const base=path.basename(full).toLowerCase()==='index.html'?path.basename(path.dirname(full)):path.basename(full,'.html');const id=byId.get(rawId)||bySlug.get(base)||pageAliases.get(base);if(!id)throw new Error(`No calculator definition matches ${full} (${rawId}, ${base})`);html=html.replace(/data-wa-calculator="[^"]+"/i,`data-wa-calculator="${id}"`);html=html.replace(/\s*<script[^>]+calculator-definitions[^>]*><\/script>/gi,'');const def=`<script src="/calculator-definitions/${id}.js?v=${stamp}" defer></script>`;const runtime=`<script src="/wa-calculator-runtime.js?v=${stamp}" defer></script>`;html=html.replace(/\s*<script[^>]+wa-calculator-runtime\.js[^>]*><\/script>/gi,'');html=html.replace('</body>',`${def}${runtime}</body>`);html=html.replace(/(<body[^>]*>)/i,'$1\n<!-- WA-CANONICAL-RUNTIME:v3 -->');}
else{
  if(isWidget){
    html=html.replace(/\s*<script[^>]+(?:wa-site-runtime|wa-calculator-runtime|calculators\.js|widget\.js|financial-engine|report-engine|financial-workspace)[^>]*><\/script>/gi,'');
    html=html.replace('</body>',`<script src="/calculators.js?v=${stamp}"></script><script src="/widget.js?v=${stamp}"></script><script src="/wa-calculator-runtime.js?v=${stamp}" defer></script></body>`);
    html=html.replace(/(<body[^>]*>)/i,'$1\n<!-- WA-WIDGET-RUNTIME:v4 -->');
  }else{
    if(!html.includes('wa-site-runtime.js'))html=html.replace('</body>',`<script src="/wa-site-runtime.js?v=${stamp}" defer></script></body>`);
    html=html.replace(/(<body[^>]*>)/i,'$1\n<!-- WA-SITE-RUNTIME:v3 -->');
  }
}
if(isScenarioLab){html=html.replace(/\s*<script\s+src=["']\/financial-engine\.js[^>]*><\/script>/gi,'').replace(/\s*<script\s+src=["']\/scenario-lab\.js[^>]*><\/script>/gi,'');html=html.replace('</body>','<script src="/financial-engine.js"></script><script src="/decision-adapters.js"></script><script src="/scenario-lab.js"></script></body>');}
if(isWorkspacePage){html=html.replace(/\s*<script\s+src=["']\/financial-engine\.js[^>]*><\/script>/gi,'').replace(/\s*<script\s+src=["']\/report-engine\.js[^>]*><\/script>/gi,'').replace(/\s*<script\s+src=["']\/financial-workspace\.js[^>]*><\/script>/gi,'');html=html.replace('</body>','<script src="/financial-engine.js"></script><script src="/report-engine.js"></script><script src="/financial-workspace.js"></script></body>');}
if(isGoalPlanner){html=html.replace(/\s*<script\s+src=["']\/financial-engine\.js[^>]*><\/script>/gi,'').replace(/\s*<script\s+src=["']\/goal-planner\.js[^>]*><\/script>/gi,'');html=html.replace('</body>','<script src="/financial-engine.js"></script><script src="/decision-adapters.js"></script><script src="/goal-planner.js"></script></body>');}
if(isCalc){
  const m=relPath.match(/^([^/]+)\/index\.html$/);
  const calculatorValueContent=JSON.parse(fs.readFileSync(path.join(root,'calculator-value-content.json'),'utf8'));
const calculatorContentMap={
    'sip-calculator':'sip-calculator.html','compound-interest-calculator':'compound-interest-calculator.html','mortgage-emi-calculator':'mortgage-emi-calculator.html','roi-calculator':'roi-calculator.html','simple-interest-calculator':'simple-interest-calculator.html','retirement-calculator':'retirement-calculator.html','salary-to-hourly-calculator':'salary-to-hourly-calculator.html','profit-margin-calculator':'profit-margin-calculator.html','fixed-deposit-calculator':'fixed-deposit-calculator.html','recurring-deposit-calculator':'recurring-deposit-calculator.html','lumpsum-calculator':'lumpsum-calculator.html','cagr-calculator':'cagr-calculator.html','car-loan-calculator':'car-loan-calculator.html','personal-loan-calculator':'personal-loan-calculator.html','debt-payoff-calculator':'debt-payoff-calculator.html','inflation-calculator':'inflation-calculator.html','net-worth-calculator':'net-worth-calculator.html','overtime-pay-calculator':'overtime-pay-calculator.html','freelance-rate-calculator':'freelance-rate-calculator.html','income-tax-scenario-calculator':'income-tax-scenario-calculator.html'
  };
  if(m && calculatorContentMap[m[1]]){
    const sourcePath=path.join(root,calculatorContentMap[m[1]]);
    if(fs.existsSync(sourcePath)){
      const sourceHtml=fs.readFileSync(sourcePath,'utf8');
      const sourceArticle=sourceHtml.match(/<article class="tool-article">[\s\S]*?<\/article>/i)?.[0];
      if(sourceArticle) html=html.replace(/<article class="tool-article">[\s\S]*?<\/article>/i,sourceArticle);
    }
  }
  const value=m && calculatorValueContent[m[1]];
  if(value && !html.includes('WA-CALCULATOR-VALUE-GUIDE')){
    const block='<!-- WA-CALCULATOR-VALUE-GUIDE --> <section class="calculator-value-guide" aria-labelledby="calculator-value-guide-title"><h2 id="calculator-value-guide-title">'+value.heading+'</h2><p>'+value.body+'</p></section>';
    html=html.replace(/<\/article>/i,block+'</article>');
  }
}
if(isWidget){
  const widgetCalculators='<script src="/calculators.js?v='+stamp+'" defer></script>';
  const widgetRuntime='<script src="/wa-calculator-runtime.js?v='+stamp+'" defer></script>';
  if(!html.includes('/calculators.js')) html=html.replace('</body>',widgetCalculators+'</body>');
  if(!html.includes('/wa-calculator-runtime.js')) html=html.replace('</body>',widgetRuntime+'</body>');
}
const sourceRegistry=JSON.parse(fs.readFileSync(path.join(root,'content-sources.json'),'utf8'));
function sourceSetForArticle(rel){
  const n=rel.toLowerCase();
  if(n.includes('sip')||n.includes('cagr')||n.includes('compound')||n.includes('return')||n.includes('investment')) return sourceRegistry.investment;
  if(n.includes('inflation')||n.includes('retirement')||n.includes('one-crore')||n.includes('real-return')) return [...sourceRegistry.inflation,...sourceRegistry.investment];
  if(n.includes('loan')||n.includes('emi')||n.includes('debt')||n.includes('mortgage')) return sourceRegistry.banking;
  if(n.includes('tax')) return sourceRegistry.tax;
  return sourceRegistry.general;
}
const isArticle=/^articles\/[^/]+\.html$/.test(relPath);
if(isArticle){
  html=html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi,(tag,json)=>{
    try{
      const data=JSON.parse(json);
      if(data && data["@type"]==="Article"){
        if(!data.image)data.image="https://wealtharrays.com/og-image.png";
        if(!data.datePublished && data.dateModified)data.datePublished=data.dateModified;
        data.author={"@type":"Person","name":"Alok Goyal","url":"https://wealtharrays.com/about"};
      }
      const logoUrl="https://wealtharrays.com/favicon-v2.svg";
      if(data && data["@type"]==="Organization" && !data.logo)data.logo=logoUrl;
      if(data && data.author && data.author["@type"]==="Organization" && !data.author.logo)data.author.logo=logoUrl;
      if(data && data.publisher && data.publisher["@type"]==="Organization" && !data.publisher.logo)data.publisher.logo=logoUrl;
      return '<script type="application/ld+json">'+JSON.stringify(data)+'</script>';
    }catch{
      if(/"@type"\s*:\s*"Article"/.test(json)){
        const title=(html.match(/<title>([\s\S]*?)<\/title>/i)||[])[1]?.replace(/<[^>]+>/g,'').trim()||'Wealth Arrays Guide';
        const description=(html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)||[])[1]||'';
        const canonical=(html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)||[])[1]||'';
        const date=(json.match(/"dateModified"\s*:\s*"([^"]+)"/)||json.match(/"datePublished"\s*:\s*"([^"]+)"/)||[])[1]||stamp.slice(0,4)+'-'+stamp.slice(4,6)+'-'+stamp.slice(6,8);
        const data={"@context":"https://schema.org","@type":"Article","headline":title,"description":description,"author":{"@type":"Person","name":"Alok Goyal","url":"https://wealtharrays.com/about"},"publisher":{"@type":"Organization","name":"Wealth Arrays","url":"https://wealtharrays.com/","logo":"https://wealtharrays.com/favicon-v2.svg"},"datePublished":date,"dateModified":date,"mainEntityOfPage":canonical||undefined,"image":"https://wealtharrays.com/og-image.png"};
        return '<script type="application/ld+json">'+JSON.stringify(data)+'</script>';
      }
      return tag;
    }
  });
}
if(isArticle){
  if(!html.includes('WA-AUTHORITATIVE-SOURCES')){
    const sources=sourceSetForArticle(relPath).map(x=>'<li><a href="'+x.url+'" rel="noopener noreferrer">'+x.name+'</a> — '+x.reason+'</li>').join('');
    const block='<section class="article-sources" id="sources" aria-labelledby="article-sources-title"><h2 id="article-sources-title">Authoritative sources and further reading</h2><p>These official sources provide background or current rules relevant to this guide. Wealth Arrays does not treat them as investment recommendations.</p><ul>'+sources+'</ul></section>';
    html=html.replace(/<\/article>/i,'<!-- WA-AUTHORITATIVE-SOURCES -->'+block+'</article>');
  }
  html=html.replace(/<p>\s*<strong>Written and maintained by Wealth Arrays\.<\/strong>[\s\S]*?<\/p>/i,'');if(!/Written and maintained by Alok Goyal/i.test(html))html=html.replace(/(<h1[^>]*>[\s\S]*?<\/h1>)/i,'$1<p class="article-byline"><strong>Written and maintained by Alok Goyal, founder and creator of Wealth Arrays.</strong> This guide is educational and not personalised financial advice.</p>');}const adsExcluded=isWidget||relPath==='404.html';if(adsExcluded)html=html.replace(/\s*<script[^>]+adsbygoogle\.js[^>]*><\/script>/gi,'').replace(/\s*<link[^>]+(?:pagead2\.googlesyndication\.com|googleads\.g\.doubleclick\.net)[^>]*>/gi,'').replace(/\s*<link[^>]+(?:pagead2\.googlesyndication\.com|googleads\.g\.doubleclick\.net)[^>]*>/gi,'');if(!html.includes('/cls-fixes.css'))html=html.replace('</head>','<link rel="stylesheet" href="/cls-fixes.css?v=20260917" media="all"></head>');
  if(isWidget){
    html=html.replace(/\s*<script[^>]+(?:wa-site-runtime|wa-calculator-runtime|calculators\.js|widget\.js|financial-engine|report-engine|financial-workspace)[^>]*><\/script>/gi,'');
    html=html.replace(/\s*<!-- WA-(?:SITE|CANONICAL|WIDGET)-RUNTIME:[^>]+-->/g,'');
    html=html.replace('</body>',`<script src="/calculators.js?v=${stamp}"></script><script src="/widget.js?v=${stamp}"></script></body>`);
  }
  fs.writeFileSync(full,html,'utf8');}

const routes=['/','/tools','/scenario-lab','/goal-planner','/financial-workspace','/articles','/faq','/about','/contact','/privacy','/terms','/disclaimer','/methodology','/editorial-policy','/advertising-policy','/category-investment','/category-loan','/category-banking','/category-retirement','/category-salary','/category-business',...slugs.map(s=>`/${s}/`)];for(const full of allHtml){const rel=path.relative(root,full).replaceAll(path.sep,'/');if(/^articles\/[^/]+\.html$/.test(rel))routes.push('/'+rel.replace(/\.html$/,''));}
const unique=[...new Set(routes)];const today=new Date().toISOString().slice(0,10);const sitemap=['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',...unique.map(u=>`  <url><loc>https://wealtharrays.com${u}</loc><lastmod>${today}</lastmod></url>`),'</urlset>',''].join('\n');fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap,'utf8');console.log(`Root-cause build complete: canonical site search, calculator search, current favicon, 20 split definitions, normalized calculator IDs, legacy route aliases, nested route support, absolute styles, CLS reservation, deterministic sitemap, ${allHtml.length} HTML files normalized.`);