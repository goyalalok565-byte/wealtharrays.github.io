import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';

const root=process.cwd();
const stamp=new Date().toISOString().replace(/\D/g,'').slice(0,14);
const siteSources=['wa-core.js','site-runtime.js','final-polish.js','theme-fix.js','phase3-seo.js','phase4-premium.js','calculator-search.js'];
const homeSources=['final-polish.js','theme-fix.js','phase3-seo.js','phase4-premium.js'];
const calcSources=['widget.js','widget-bootstrap.js',...siteSources,'calculator-safety.js','calculator-page-init.js','calculator-enhancements.js','pdf-export-fix.js'];
let calculatorPages=[];
let slugs=[];
const required=[...new Set([...siteSources,...calcSources,'calculators.js'])];
for(const f of required)if(!fs.existsSync(path.join(root,f)))throw new Error(`Missing runtime source: ${f}`);
if(!fs.existsSync(path.join(root,'homepage-search.js')))throw new Error('Missing homepage-specific search source: homepage-search.js');
function bundle(sources,label){const parts=sources.map(file=>{const body=fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n').trimEnd();const hash=crypto.createHash('sha256').update(body).digest('hex').slice(0,12);return `/* ===== WA CANONICAL MODULE | ${label} | ${file} | sha256:${hash} ===== */\n${body}\n`;});return `/* Wealth Arrays canonical ${label} runtime. Generated ${stamp}. */\n(function(){const k='__WA_CANONICAL_${label.toUpperCase()}_RUNTIME__';if(window[k])return;window[k]=true;})();\n${parts.join('\n')}`;}
fs.writeFileSync(path.join(root,'wa-site-runtime.js'),bundle(siteSources,'site'),'utf8');
fs.writeFileSync(path.join(root,'wa-home-runtime.js'),bundle(homeSources,'home'),'utf8');
fs.writeFileSync(path.join(root,'wa-calculator-runtime.js'),bundle(calcSources,'calculator'),'utf8');

const source=fs.readFileSync(path.join(root,'calculators.js'),'utf8');
const calculatorContext={console};vm.createContext(calculatorContext);vm.runInContext(source+'\n;globalThis.__WA_CALCULATORS__=CALCULATORS;',calculatorContext,{filename:'calculators.js'});
const calculatorRuntimeDefinitions=calculatorContext.__WA_CALCULATORS__;
const start=source.indexOf('const CALCULATORS = [');
const end=source.indexOf('\n];',start);
if(start<0||end<0)throw new Error('CALCULATORS definition list not found');
const body=source.slice(start+'const CALCULATORS = ['.length,end);
const objects=[];let depth=0,begin=-1,string=null,escaped=false;
for(let i=0;i<body.length;i++){const c=body[i];if(string){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c===string)string=null;continue}if(c==='"'||c==="'"||c==='`'){string=c;continue}if(c==='{'){if(depth===0)begin=i;depth++;continue}if(c==='}'){depth--;if(depth===0&&begin>=0){objects.push(body.slice(begin,i+1).trim());begin=-1}}}
if(objects.length<1)throw new Error('No calculator definitions found');
const definitions=objects.map(obj=>({obj,id:obj.match(/\bid:\s*["']([^"']+)["']/)?.[1],slug:obj.match(/\bslug:\s*["']([^"']+)["']/)?.[1]}));
if(definitions.some(x=>!x.id||!x.slug))throw new Error('Calculator definition is missing id or slug');
calculatorPages=definitions.map(x=>`${x.slug}/index.html`);
slugs=definitions.map(x=>x.slug);
const bySlug=new Map(definitions.filter(x=>x.slug).map(x=>[x.slug,x.id]));
const byId=new Map(definitions.map(x=>[x.id,x.id]));
const pageAliases=new Map([['income-tax-scenario-calculator','income-tax-planner']]);
const defDir=path.join(root,'calculator-definitions');fs.mkdirSync(defDir,{recursive:true});
for(const {obj,id} of definitions)fs.writeFileSync(path.join(defDir,`${id}.js`),`/* Generated from calculators.js — do not edit directly. */\nwindow.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push(${obj});\n`,'utf8');

const allHtml=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory()){if(!['.git','node_modules','dist'].includes(e.name))walk(f);}else if(e.name.endsWith('.html'))allHtml.push(f);}}walk(root);
const managed=new Set([...required,'wa-site-runtime.js','wa-home-runtime.js','wa-calculator-runtime.js','financial-engine.js','decision-adapters.js','scenario-lab.js','goal-planner.js','financial-workspace.js','report-engine.js','formula-registry.js','i18n.js','accessibility.js','analytics.js','visualization.js']);
const isScenarioLabPage=(rel)=>rel==='scenario-lab.html';
const isGoalPlannerPage=(rel)=>rel==='goal-planner.html';
const isWorkspacePage=(rel)=>rel==='financial-workspace.html';
const isUtilityNoindexPage=(rel)=>isScenarioLabPage(rel)||isGoalPlannerPage(rel)||isWorkspacePage(rel);
for(const full of allHtml){
  let html=fs.readFileSync(full,'utf8');
  // Normalize legacy empty navigation targets at source/build level so future generated pages never emit dead self-links.
  html=html.replace(/href=[\"']{2}/g, 'href="/"');
  const relPath=path.relative(root,full).replaceAll(path.sep,'/');
  const isWidget=relPath==='widget.html'||relPath==='widget/index.html';
  if(isUtilityNoindexPage(relPath) && !/<meta\s+name=[\"']robots[\"']/i.test(html)) html=html.replace('</head>','<meta name="robots" content="noindex,follow"></head>');
  const isScenarioLab=isScenarioLabPage(relPath);
  const isGoalPlanner=isGoalPlannerPage(relPath);
  const isWorkspacePageCurrent=isWorkspacePage(relPath);
  const isCalc=/<html[^>]+data-wa-calculator=/i.test(html);
  // Add a static skip link and target so accessibility does not depend on JavaScript execution.
  if(!/class=["'][^"']*wa-skip-link/i.test(html)){
    const firstMain=html.match(/<main\b[^>]*>/i);
    if(firstMain){
      let target=(firstMain[0].match(/\bid=["']([^"']+)["']/i)||[])[1];
      if(!target){
        target='main-content';
        html=html.replace(firstMain[0],firstMain[0].replace(/<main\b/i,'<main id="main-content"'));
      }
      html=html.replace(/<body\b[^>]*>/i,match=>match+'<a class="wa-skip-link" href="#'+target+'">Skip to main content</a>');
    }
  }
  // Ensure social metadata exists on every HTML route, including older/static pages.
  // Normalize India-facing social metadata on every route generated by this build.
  html=html.replace(/(<meta\s+property=["']og:locale["']\s+content=["'])[^"']*(["'][^>]*>)/gi,'$1en_IN$2');
  if(!/<meta[^>]+property=["']og:locale["']/i.test(html)) html=html.replace('</head>','<meta property="og:locale" content="en_IN"></head>');
  html=html.replace(/(<meta\s+name=["']twitter:image["'][^>]*content=["'])[^"']*(["'][^>]*>)/gi,'$1https://wealtharrays.com/og-image.png$2');
  html=html.replace(/(<meta\s+name=["']twitter:image["']\s+content=["'])[^"']*(["'][^>]*>)/gi,'$1https://wealtharrays.com/og-image.png$2');
  html=html.replace(/https:\/\/wealtharrays\.com\/og-card\.svg/gi,'https://wealtharrays.com/og-image.png');
  if(!/<meta[^>]+name=["']twitter:image["']/i.test(html)) html=html.replace('</head>','<meta name="twitter:image" content="https://wealtharrays.com/og-image.png"></head>');
  const headingHtml=(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)||[])[1]?.trim();
  if(headingHtml) html=html.replace(/<span>\s*Current calculator\s*<\/span>/gi,'<span>'+headingHtml+'</span>');
  const pageTitle=(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]?.trim()||'Wealth Arrays';
  const pageDescription=(html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)||[])[1]||'Financial calculators and practical money guides from Wealth Arrays.';
  const attrSafe=value=>value.replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  if(!/<meta[^>]+property=["']og:title["']/i.test(html)) html=html.replace('</head>','<meta property="og:title" content="'+attrSafe(pageTitle)+'"></head>');
  if(!/<meta[^>]+name=["']twitter:card["']/i.test(html)) html=html.replace('</head>','<meta name="twitter:card" content="summary"></head>');
  if(!/<meta[^>]+property=["']og:description["']/i.test(html)) html=html.replace('</head>','<meta property="og:description" content="'+attrSafe(pageDescription)+'"></head>');
  if(!/<meta[^>]+name=["']twitter:description["']/i.test(html)) html=html.replace('</head>','<meta name="twitter:description" content="'+attrSafe(pageDescription)+'"></head>');
  // Calculator FAQPage schema is intentionally omitted until it can be generated from the exact visible FAQ markup.
  if(isCalc) html=html.replace(/<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>/gi,tag=>/"@type"\s*:\s*"FAQPage"/.test(tag)?'':tag);
  html=html.replace(/\s*<script\s+src=["']([^"']+)[^>]*><\/script>/gi,(tag,src)=>{
    const base=path.basename(src.split('?',1)[0]);
    const keep=managed.has(base)||(isWidget&&['calculators.js','widget.js','widget-bootstrap.js','wa-calculator-runtime.js'].includes(base))||(isScenarioLab&&['financial-engine.js','decision-adapters.js','scenario-lab.js'].includes(base))||(isGoalPlanner&&['financial-engine.js','decision-adapters.js','goal-planner.js'].includes(base))||(isWorkspacePageCurrent&&['financial-engine.js','report-engine.js','financial-workspace.js'].includes(base));
    return keep?'':tag;
  });html=html.replace(/\s*<!-- WA-(?:SITE|HOME|CANONICAL)-RUNTIME:[^>]+-->\s*/g,'\n');
html=html.replace(/(<link\s+[^>]*rel=["'](?:preload|stylesheet)["'][^>]*href=["'])\/?styles\.css(?:\?[^"']*)?(["'][^>]*>)/gi,'$1/styles.css?v='+stamp+'$2');html=html.replace(/(<link\s+[^>]*href=["'])\/?styles\.css(?:\?[^"']*)?(["'][^>]*rel=["'](?:preload|stylesheet)["'][^>]*>)/gi,'$1/styles.css?v='+stamp+'$2');if(!/href=["']\/styles\.css(?:\?[^"']*)?["']/.test(html))html=html.replace('</head>','<link rel="stylesheet" href="/styles.css?v='+stamp+'"></head>');
html=html.replace(/\s*<link\s+[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*>/gi,'');
html=html.replace('</head>','<link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" type="image/png" sizes="48x48" href="/icon-192.png"><link rel="apple-touch-icon" sizes="180x180" href="/icon-512.png"></head>');
if(isCalc){const rawId=html.match(/data-wa-calculator="([^"]+)"/i)?.[1];if(!rawId)throw new Error(`Calculator page missing data-wa-calculator: ${full}`);const base=path.basename(full).toLowerCase()==='index.html'?path.basename(path.dirname(full)):path.basename(full,'.html');const id=byId.get(rawId)||bySlug.get(base)||pageAliases.get(base);if(!id)throw new Error(`No calculator definition matches ${full} (${rawId}, ${base})`);html=html.replace(/data-wa-calculator="[^"]+"/i,`data-wa-calculator="${id}"`);html=html.replace(/\s*<script[^>]+calculator-definitions[^>]*><\/script>/gi,'');const def=`<script src="/calculator-definitions/${id}.js?v=${stamp}" defer></script>`;const runtime=`<script src="/wa-calculator-runtime.js?v=${stamp}" defer></script>`;html=html.replace(/\s*<script[^>]+wa-calculator-runtime\.js[^>]*><\/script>/gi,'');html=html.replace('</body>',`${def}${runtime}</body>`);html=html.replace(/(<body[^>]*>)/i,'$1\n<!-- WA-CANONICAL-RUNTIME:v3 -->');}
else{
  if(isWidget){
    html=html.replace(/\s*<script[^>]+(?:wa-site-runtime|wa-calculator-runtime|calculators\.js|widget\.js|financial-engine|report-engine|financial-workspace)[^>]*><\/script>/gi,'');
    html=html.replace('</body>',`<script src="/calculators.js?v=${stamp}"></script></body>`);
    html=html.replace(/(<body[^>]*>)/i,'$1\n<!-- WA-WIDGET-RUNTIME:v4 -->');
  }else{
    if(relPath==='index.html'){
      if(!html.includes('wa-home-runtime.js'))html=html.replace('</body>',`<script src="/wa-home-runtime.js?v=${stamp}" defer></script></body>`);
      html=html.replace(/(<body[^>]*>)/i,'$1\n<!-- WA-HOME-RUNTIME:v1 -->');
    }else{
      if(!html.includes('wa-site-runtime.js'))html=html.replace('</body>',`<script src="/wa-site-runtime.js?v=${stamp}" defer></script></body>`);
      html=html.replace(/(<body[^>]*>)/i,'$1\n<!-- WA-SITE-RUNTIME:v3 -->');
    }
  }
}
if(isScenarioLab){html=html.replace(/\s*<script\s+src=["']\/financial-engine\.js[^>]*><\/script>/gi,'').replace(/\s*<script\s+src=["']\/scenario-lab\.js[^>]*><\/script>/gi,'');html=html.replace('</body>','<script src="/financial-engine.js"></script><script src="/decision-adapters.js"></script><script src="/scenario-lab.js"></script></body>');}
if(isWorkspacePageCurrent){html=html.replace(/\s*<script\s+src=["']\/financial-engine\.js[^>]*><\/script>/gi,'').replace(/\s*<script\s+src=["']\/report-engine\.js[^>]*><\/script>/gi,'').replace(/\s*<script\s+src=["']\/financial-workspace\.js[^>]*><\/script>/gi,'');html=html.replace('</body>','<script src="/financial-engine.js"></script><script src="/report-engine.js"></script><script src="/financial-workspace.js"></script></body>');}
if(isGoalPlanner){html=html.replace(/\s*<script\s+src=["']\/financial-engine\.js[^>]*><\/script>/gi,'').replace(/\s*<script\s+src=["']\/goal-planner\.js[^>]*><\/script>/gi,'');html=html.replace('</body>','<script src="/financial-engine.js"></script><script src="/decision-adapters.js"></script><script src="/goal-planner.js"></script></body>');}
if(isCalc){
  const m=relPath.match(/^([^/]+)\/index\.html$/);
  const calculatorValueContent=JSON.parse(fs.readFileSync(path.join(root,'calculator-value-content.json'),'utf8'));
  const value=m && calculatorValueContent[m[1]];
  if(value){
    const escText=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const block='<!-- WA-CALCULATOR-VALUE-GUIDE --><section class="calculator-value-guide" aria-labelledby="calculator-value-guide-title"><h2 id="calculator-value-guide-title">'+escText(value.heading)+'</h2><p>'+escText(value.body)+'</p></section>';
    if(html.includes('WA-CALCULATOR-VALUE-GUIDE')) html=html.replace(/<!-- WA-CALCULATOR-VALUE-GUIDE -->\s*<section class="calculator-value-guide"[\s\S]*?<\/section>/i,block);
    else html=html.replace(/<\/article>/i,block+'</article>');
    const guideCalcId=html.match(/data-wa-calculator="([^"]+)"/i)?.[1];
    const guideCalc=calculatorRuntimeDefinitions.find(c=>c.id===guideCalcId);
    const sampleInputs=guideCalc?.article?.exampleInputs||{};
    const sampleInputText=guideCalc?.fields?.filter(field=>Object.prototype.hasOwnProperty.call(sampleInputs,field.id)).map(field=>field.label+': '+String(sampleInputs[field.id])).join('; ')||'the example inputs shown in the calculator definition';
    const derivedSections=Array.isArray(value.sections)&&value.sections.length?value.sections:[
      {heading:'Formula and assumptions for this calculator',body:guideCalc?.article?.formula||value.body},
      {heading:'How to validate your inputs',body:'Use the published example inputs as a baseline: '+sampleInputText+'. Confirm the unit, period and eligibility conditions for each input against your own documents or the relevant provider. Change one assumption at a time and compare the output with an independent statement, invoice or schedule before making a material decision.'}
    ];
    const extraSections=derivedSections.map(section=>'<section class="calculator-specific-guidance"><h2>'+escText(section.heading)+'</h2><p>'+escText(section.body)+'</p></section>').join('');
    let workedText=value.worked||'';
    if(!workedText&&guideCalc?.article?.exampleInputs&&typeof guideCalc.compute==='function'){
      const sample=guideCalc.article.exampleInputs;
      const inputLabels=guideCalc.fields.filter(field=>Object.prototype.hasOwnProperty.call(sample,field.id)).map(field=>field.label+': '+String(sample[field.id]));
      try{
        const rows=guideCalc.compute(sample)||[];
        const numberFmt=new Intl.NumberFormat('en-IN',{maximumFractionDigits:2});
        const outputLabels=rows.slice(0,3).map(row=>row.label+': '+(row.format==='currency'?'₹':'')+numberFmt.format(row.value)+(row.format==='percent'?'%':row.format==='years'?' years':''));
        workedText='Example inputs — '+inputLabels.join('; ')+'. Using the calculator formula, the illustrative outputs are '+outputLabels.join('; ')+'. These results follow the stated assumptions and are not a guarantee of a real-world outcome.';
      }catch(error){workedText='Example inputs — '+inputLabels.join('; ')+'. Enter these values to reproduce a worked scenario, then change one input at a time to see how the result responds.';}
    }
    const worked=workedText?'<section class="worked-example" aria-labelledby="worked-example-title"><h2 id="worked-example-title">Worked example with Indian rupees</h2><p>'+escText(workedText)+'</p></section>':'';
    const relatedArticleMap={investment:['/articles/how-to-compare-sip-scenarios-properly','Compare investment scenarios'],loan:['/articles/how-to-compare-loan-offers-beyond-emi','Compare loan offers beyond EMI'],banking:['/articles/compound-interest-guide','Understand compounding'],retirement:['/articles/how-to-stress-test-a-retirement-goal','Stress-test a retirement goal'],salary:['/articles/how-to-use-a-salary-to-hourly-calculator','Understand pay calculations'],business:['/articles/how-to-use-financial-calculators','How to use financial calculators']};
    const relatedArticle=value.article?[value.article,'Read the related Wealth Arrays guide']:(relatedArticleMap[guideCalc?.category]||relatedArticleMap.business);
    const articleLink='<p class="related-reading">Related reading: <a href="'+escText(relatedArticle[0])+'">'+escText(relatedArticle[1])+'</a> for additional context.</p>';
    const extras=extraSections+worked+articleLink;
    html=html.replace(/<!-- WA-CALCULATOR-EXTRA-GUIDANCE -->[\s\S]*?<!-- \/WA-CALCULATOR-EXTRA-GUIDANCE -->/i,'');
    if(extras)html=html.replace(/<\/article>/i,'<!-- WA-CALCULATOR-EXTRA-GUIDANCE -->'+extras+'<!-- /WA-CALCULATOR-EXTRA-GUIDANCE --></article>');
  }
  const pageCalcId=html.match(/data-wa-calculator="([^"]+)"/i)?.[1];
  const calcDefinition=definitions.find(x=>x.id===pageCalcId);
  const faqMatch=calcDefinition?.obj.match(/faqs\s*:\s*\[([\s\S]*?)\](?=,?\s*\},\s*fields)/);
  if(faqMatch){
    const escapeFaqHtml=value=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const faqItems=[...faqMatch[1].matchAll(/\{\s*q:\s*("(?:\\.|[^"\\])*")\s*,\s*a:\s*("(?:\\.|[^"\\])*")\s*\}/g)].map(m=>'<div class="faq-item"><h3>'+escapeFaqHtml(JSON.parse(m[1]))+'</h3><p>'+escapeFaqHtml(JSON.parse(m[2]))+'</p></div>').join('');
    if(faqItems) html=html.replace(/<h2>Frequently asked questions<\/h2>[\s\S]*?(?=<h2>Related calculators<\/h2>)/i,'<h2>Frequently asked questions</h2>'+faqItems);
  }
  const titleMatch=calcDefinition?.obj.match(/\btitle:\s*["']([^"']+)["']/);
  const descMatch=calcDefinition?.obj.match(/\bdesc:\s*["']([^"']+)["']/);
  const seoTitle=(titleMatch?.[1]||'Financial Calculator')+' | Wealth Arrays';
  const rawSeoDescription=(value?.description||descMatch?.[1]||'Use this free financial calculator to estimate results from your inputs and review the assumptions.').replace(/\s+/g,' ').trim();
  const seoDescription=(rawSeoDescription.length<70?(value?.body||rawSeoDescription):rawSeoDescription).replace(/\s+/g,' ').trim().slice(0,158);
  html=html.replace(/<title[^>]*>[\s\S]*?<\/title>/i,'<title>'+seoTitle.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</title>');
  if(/<meta[^>]+name=["']description["']/i.test(html))html=html.replace(/<meta([^>]+name=["']description["'][^>]+content=["'])[^"']*(["'][^>]*>)/i,'<meta$1'+seoDescription.replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'$2');
  else html=html.replace('</head>','<meta name="description" content="'+seoDescription.replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'"></head>');
  if(/<meta[^>]+property=["']og:title["']/i.test(html))html=html.replace(/<meta[^>]+property=["']og:title["'][^>]*>/i,'<meta property="og:title" content="'+seoTitle.replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'">');
  if(/<meta[^>]+property=["']og:description["']/i.test(html))html=html.replace(/<meta[^>]+property=["']og:description["'][^>]*>/i,'<meta property="og:description" content="'+seoDescription.replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'">');
  const schemaUrl='https://wealtharrays.com/'+relPath.replace(/\/index\.html$/,'').replace(/\.html$/,'').replace(/\/$/,'')+'/';
  const schema={"@context":"https://schema.org","@graph":[
    {"@type":"SoftwareApplication","name":titleMatch?.[1]||"Financial Calculator","applicationCategory":"FinanceApplication","operatingSystem":"Any","isAccessibleForFree":true,"description":seoDescription,"url":schemaUrl,"offers":{"@type":"Offer","price":"0","priceCurrency":"INR"}},
    {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://wealtharrays.com/"},{"@type":"ListItem","position":2,"name":"Calculators","item":"https://wealtharrays.com/tools"},{"@type":"ListItem","position":3,"name":titleMatch?.[1]||"Financial Calculator","item":schemaUrl}]}
  ]};
  const schemaTag='<!-- WA-CALCULATOR-SCHEMA --><script type="application/ld+json">'+JSON.stringify(schema)+'</script>';
  html=html.replace(/<!-- WA-CALCULATOR-SCHEMA -->\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/i,'');
  html=html.replace('</head>',schemaTag+'</head>');
  const fieldLabels=[...((calcDefinition?.obj||'').matchAll(/\blabel:\s*["']([^"']+)["']/g))].map(m=>m[1]);
  if(fieldLabels.length){
    const fieldsSentence='For this calculator, check these inputs and units: '+fieldLabels.join('; ')+'. Keep monthly and annual figures separate, and change one input at a time when comparing scenarios.';
    html=html.replace(/<p>Start by entering values that match your situation and check the unit shown beside each input\.[\s\S]*?<\/p>/i,'<p>'+fieldsSentence+'</p>');
    html=html.replace(/<p>If a field represents an annual rate, keep it annual unless the label explicitly says monthly\.[\s\S]*?<\/p>/i,'');
  }
  if(value && Array.isArray(value.sections) && value.sections.length){
    html=html.replace(/<h2>How to use the result responsibly<\/h2>\s*<p>Do not treat one output as a prediction\.[\s\S]*?<\/p>/i,'');
  }
}
if(isWidget){
  const widgetCalculators='<script src="/calculators.js?v='+stamp+'"></script>';
  const widgetRuntime='<script src="/wa-calculator-runtime.js?v='+stamp+'"></script>';
  const widgetBootstrap='<script src="/widget-bootstrap.js"></script>';
  html=html.replace(/\s*<script[^>]+src=["']\/calculators\.js[^>]*><\/script>/gi,'');
  html=html.replace(/\s*<script[^>]+src=["']\/wa-calculator-runtime\.js[^>]*><\/script>/gi,'');
  html=html.replace(/\s*<script[^>]+src=["']\/widget-bootstrap\.js[^>]*><\/script>/gi,'');
  html=html.replace('</body>',widgetCalculators+widgetRuntime+widgetBootstrap+'</body>');
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
  html=html.replace(/<p>\s*<strong>Written and maintained by Wealth Arrays\.<\/strong>[\s\S]*?<\/p>/i,'');if(!/Written and maintained by Alok Goyal/i.test(html))html=html.replace(/(<h1[^>]*>[\s\S]*?<\/h1>)/i,'$1<p class="article-byline"><strong>Written and maintained by Alok Goyal, founder and creator of Wealth Arrays.</strong> This guide is educational and not personalised financial advice.</p>');}
  const textForWordCount=(html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)||html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)||html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)||['',''])[1]
    .replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&[a-z#0-9]+;/gi,' ').replace(/\s+/g,' ').trim();
  const visibleWordCount=textForWordCount?textForWordCount.split(/\s+/).length:0;
  const isThinPage=(isCalc&&visibleWordCount<600)||(relPath==='advanced-finance-tools/index.html'&&visibleWordCount<450);
  if(isThinPage){
    if(/<meta\s+name=["']robots["']/i.test(html))html=html.replace(/<meta\s+name=["']robots["'][^>]*>/i,'<meta name="robots" content="noindex,follow">');
    else html=html.replace('</head>','<meta name="robots" content="noindex,follow"></head>');
    html=html.replace(/\s*<script[^>]+(?:adsbygoogle\.js|pagead2\.googlesyndication\.com)[^>]*><\/script>/gi,'')
      .replace(/<ins\b[^>]*class=["'][^"']*adsbygoogle[^"']*["'][^>]*>[\s\S]*?<\/ins>/gi,'')
      .replace(/<div\b[^>]*class=["'][^"']*(?:ad-slot|ad-container|advertisement)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,'');
  }
  const adsExcluded=isWidget||relPath==='404.html'||relPath==='index.html'||isThinPage||/<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
  if(adsExcluded)html=html.replace(/\s*<script[^>]+adsbygoogle\.js[^>]*><\/script>/gi,'').replace(/\s*<link[^>]+(?:pagead2\.googlesyndication\.com|googleads\.g\.doubleclick\.net)[^>]*>/gi,'').replace(/\s*<link[^>]+(?:pagead2\.googlesyndication\.com|googleads\.g\.doubleclick\.net)[^>]*>/gi,'');if(!html.includes('/cls-fixes.css'))html=html.replace('</head>','<link rel="stylesheet" href="/cls-fixes.css?v=20260917" media="all"></head>');
  if(isWidget){
    html=html.replace(/\s*<script[^>]+(?:wa-site-runtime|wa-calculator-runtime|calculators\.js|widget\.js|financial-engine|report-engine|financial-workspace)[^>]*><\/script>/gi,'');
    html=html.replace(/\s*<!-- WA-(?:SITE|CANONICAL|WIDGET)-RUNTIME:[^>]+-->/g,'');
    html=html.replace('</body>',`<script src="/calculators.js?v=${stamp}"></script><script src="/wa-calculator-runtime.js?v=${stamp}" defer></script></body>`);
  }
  if(isCalc && !html.includes('/wa-calculator-runtime.js')) html=html.replace('</body>','<script src="/wa-calculator-runtime.js" defer></script></body>');
  if(isUtilityNoindexPage(relPath) && !html.includes('WA-UTILITY-LEGAL-FOOTER')){
    html=html.replace('</body>','<footer class="site-footer premium-footer"><div class="site-footer-inner"><nav class="footer-nav-box" aria-label="Company and legal pages"><a class="footer-link" href="/privacy">Privacy Policy</a><a class="footer-link" href="/terms">Terms &amp; Conditions</a><a class="footer-link" href="/disclaimer">Disclaimer</a><a class="footer-link" href="/about">About Us</a><a class="footer-link" href="/contact">Contact Us</a></nav><div class="footer-bottom"><span>© 2026 Wealth Arrays</span><span>Questions or corrections: <a href="mailto:goyalalok565@gmail.com">goyalalok565@gmail.com</a></span></div></div></footer><!-- WA-UTILITY-LEGAL-FOOTER --></body>');
  }
  fs.writeFileSync(full,html,'utf8');}

const routes=['/','/tools','/articles','/research','/faq','/about','/contact','/privacy','/terms','/disclaimer','/methodology','/editorial-policy','/advertising-policy','/category-investment','/category-loan','/category-banking','/category-retirement','/category-salary','/category-business',...slugs.map(s=>`/${s}/`)];for(const full of allHtml){const rel=path.relative(root,full).replaceAll(path.sep,'/');if(/^articles\/[^/]+\.html$/.test(rel))routes.push('/'+rel.replace(/\.html$/,''));}
const unique=[...new Set(routes)].filter(u=>{let rel;if(u==='/')rel='index.html';else if(u==='/tools')rel='tools.html';else if(u.startsWith('/articles/'))rel='articles/'+u.slice('/articles/'.length)+'.html';else rel=u.replace(/^\//,'').replace(/\/$/,'')+'/index.html';const file=path.join(root,rel);if(!fs.existsSync(file))return true;const page=fs.readFileSync(file,'utf8');return !/<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(page);});const today=new Date().toISOString().slice(0,10);const sitemap=['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',...unique.map(u=>`  <url><loc>https://wealtharrays.com${u}</loc><lastmod>${today}</lastmod></url>`),'</urlset>',''].join('\n');fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap,'utf8');console.log(`Root-cause build complete: canonical site search, calculator search, current favicon, ${definitions.length} split definitions, normalized calculator IDs, legacy route aliases, nested route support, absolute styles, CLS reservation, page-specific guides, metadata and schema, thin-page noindex/ad guard, indexable-only sitemap, ${allHtml.length} HTML files normalized.`);