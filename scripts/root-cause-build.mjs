import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

const root=process.cwd();
const sourceRegistry=JSON.parse(fs.readFileSync(path.join(root,'content-sources.json'),'utf8'));
execFileSync(process.execPath,[path.join(root,'scripts/sync-calculator-catalog.mjs')],{stdio:'inherit'});
const stamp=new Date().toISOString().replace(/\D/g,'').slice(0,14);
const siteSources=['wa-core.js','site-runtime.js','final-polish.js','theme-fix.js','phase3-seo.js','phase4-premium.js','calculator-search.js'];
const homeSources=['final-polish.js','theme-fix.js','phase3-seo.js','phase4-premium.js'];
const calcSiteSources=['wa-core.js','calculator-page-currency.js'];
const calcSources=['widget.js','widget-bootstrap.js',...calcSiteSources,'calculator-safety.js','calculator-page-init.js'];
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
const defDir=path.join(root,'calculator-definitions');
if(definitions.length!==fs.readdirSync(defDir).filter(name=>name.endsWith('.js')).length)throw new Error('Canonical calculator definition count does not match the generated catalogue.');

const allHtml=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory()){if(!['.git','node_modules','dist'].includes(e.name))walk(f);}else if(e.name.endsWith('.html'))allHtml.push(f);}}walk(root);
const managed=new Set([...required,'calculator-enhancements.js','pdf-export-fix.js','wa-site-runtime.js','wa-home-runtime.js','wa-calculator-runtime.js','financial-engine.js','decision-adapters.js','scenario-lab.js','goal-planner.js','financial-workspace.js','report-engine.js','formula-registry.js','i18n.js','accessibility.js','analytics.js','visualization.js']);
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
  // Social metadata uses en_IN only for India-specific tools; other English tools use en_US.
  const indiaCalculatorIds = new Set(['income-tax-planner','lumpsum-sip','ppf-growth','epf-growth','gst','hra-exemption','ssy','nps','gratuity','stamp-duty','gold-jewelry','silver-jewelry','home-loan-eligibility','advanced-home-loan-eligibility','loan-against-property','flat-cost','capital-gain','property-calculator','home-loan-emi']);
  const calculatorId = html.match(/data-wa-calculator=["']([^"']+)["']/i)?.[1];
  const pageLocale = calculatorId && indiaCalculatorIds.has(calculatorId) ? 'en_IN' : 'en_US';
  const canonicalHref=html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1]||html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i)?.[1];
  if(canonicalHref){
    html=html.replace(/<link[^>]*rel=["']alternate["'][^>]*hreflang=["'][^"']+["'][^>]*>/gi,'');
    html=html.replace('</head>','<link rel="alternate" hreflang="en" href="'+canonicalHref+'"><link rel="alternate" hreflang="x-default" href="'+canonicalHref+'"></head>');
  }
  const ogPng='https://wealtharrays.com/og-image.png';
  html=html.replace(/(<meta\s+property=["']og:locale["']\s+content=["'])[^"']*(["'][^>]*>)/gi,'$1'+pageLocale+'$2');
  if(!/<meta[^>]+property=["']og:locale["']/i.test(html)) html=html.replace('</head>','<meta property="og:locale" content="'+pageLocale+'"></head>');
  html=html.replace(/(<meta\s+(?:name=["']twitter:image["']|property=["']og:image["'])[^>]*content=["'])[^"']*(["'][^>]*>)/gi,'$1'+ogPng+'$2');
  html=html.replace(/(<meta\s+property=["']og:image:type["'][^>]*content=["'])[^"']*(["'][^>]*>)/gi,'$1image/png$2');
  if(!/<meta[^>]+property=["']og:image["']/i.test(html)) html=html.replace('</head>','<meta property="og:image" content="'+ogPng+'"></head>');
  if(!/<meta[^>]+property=["']og:image:type["']/i.test(html)) html=html.replace('</head>','<meta property="og:image:type" content="image/png"></head>');
  if(!/<meta[^>]+name=["']twitter:image["']/i.test(html)) html=html.replace('</head>','<meta name="twitter:image" content="'+ogPng+'"></head>');
  if(!/<meta[^>]+name=["']twitter:card["']/i.test(html)) html=html.replace('</head>','<meta name="twitter:card" content="summary_large_image"></head>');
  if(!/<meta[^>]+property=["']og:image:width["']/i.test(html)) html=html.replace('</head>','<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"></head>');
  if(!/<select[^>]+id=["']country-select["']/i.test(html)) html=html.replace(/(<div class=["']masthead-controls["'][^>]*>)/i,'$1<label class="control"><span>Country</span><select id="country-select" aria-label="Country or region"></select></label>');
  const headingHtml=(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)||[])[1]?.trim();
  if(headingHtml) html=html.replace(/<span>\s*Current calculator\s*<\/span>/gi,'<span>'+headingHtml+'</span>');
  const pageTitle=(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]?.trim()||'Wealth Arrays';
  const pageDescription=(html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)||[])[1]||'Financial calculators and practical money guides from Wealth Arrays.';
  const attrSafe=value=>value.replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  if(!/<meta[^>]+property=["']og:title["']/i.test(html)) html=html.replace('</head>','<meta property="og:title" content="'+attrSafe(pageTitle)+'"></head>');
  if(!/<meta[^>]+name=["']twitter:card["']/i.test(html)) html=html.replace('</head>','<meta name="twitter:card" content="summary"></head>');
  if(!/<meta[^>]+property=["']og:description["']/i.test(html)) html=html.replace('</head>','<meta property="og:description" content="'+attrSafe(pageDescription)+'"></head>');
  if(!/<meta[^>]+name=["']twitter:description["']/i.test(html)) html=html.replace('</head>','<meta name="twitter:description" content="'+attrSafe(pageDescription)+'"></head>');
  // Calculator schema is emitted once below as a single SoftwareApplication + BreadcrumbList graph.
  // Remove legacy application/breadcrumb blocks first to prevent duplicate entities.
  if(isCalc) html=html.replace(/<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>/gi,tag=>{
    try{
      const data=JSON.parse(tag.replace(/^<script[^>]*>/i,'').replace(/<\/script>$/i,''));
      const hasType=(node,type)=>!!node&&(node["@type"]===type||(Array.isArray(node["@graph"])&&node["@graph"].some(item=>hasType(item,type))));
      if(hasType(data,"FAQPage"))return '';
      if(hasType(data,"WebApplication")||hasType(data,"SoftwareApplication")||hasType(data,"BreadcrumbList"))return '';
      return tag;
    }catch{return /"@type"\s*:\s*"FAQPage"/.test(tag)?'':tag;}
  });
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
        const numberFmt=new Intl.NumberFormat(pageLocale==='en_IN'?'en-IN':'en-US',{maximumFractionDigits:2});
        const currencySymbol=pageLocale==='en_IN'?'₹':"$";
        const outputLabels=rows.slice(0,3).map(row=>row.label+': '+(row.format==='currency'?currencySymbol:'')+numberFmt.format(row.value)+(row.format==='percent'?'%':row.format==='years'?' years':''));
        workedText='Example inputs — '+inputLabels.join('; ')+'. Using the calculator formula, the illustrative outputs are '+outputLabels.join('; ')+'. These results follow the stated assumptions and are not a guarantee of a real-world outcome.';
      }catch(error){workedText='Example inputs — '+inputLabels.join('; ')+'. Enter these values to reproduce a worked scenario, then change one input at a time to see how the result responds.';}
    }
    const workedTitle=pageLocale==='en_IN'?'Worked example in Indian rupees':'Worked example';
    const worked=workedText?'<section class="worked-example" aria-labelledby="worked-example-title"><h2 id="worked-example-title">'+workedTitle+'</h2><p>'+escText(workedText)+'</p></section>':'';
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
  const calcTitleForFaq=calcDefinition?.obj.match(/\btitle:\s*["']([^"']+)["']/)?.[1]||'this calculator';
  const calcSlugForFaq=calcDefinition?.obj.match(/\bslug:\s*["']([^"']+)["']/)?.[1]||'';
  const calcCategoryRaw=calcDefinition?.obj.match(/\bcategory:\s*["']([^"']+)["']/)?.[1]||'general';
  const calcCategoryForFaq=/(?:tax|gst|hra)/i.test(calcSlugForFaq)?'tax':calcCategoryRaw;
  const calcInputLabels=[...(calcDefinition?.obj||'').matchAll(/\blabel:\s*["']([^"']+)["']/g)].map(m=>m[1]).slice(0,4);
  const calcInputsText=calcInputLabels.length?calcInputLabels.join(', '):'the inputs shown in the calculator';
  const categoryFaqAnswers={
    investment:'Compare the assumed return, time horizon and contribution or starting amount. For '+calcTitleForFaq+', the key inputs include '+calcInputsText+'. Test a conservative, middle and optimistic return while holding the other values constant. Investment returns are uncertain, and fees, taxes and inflation may reduce the real outcome.',
    loan:'Change the interest rate and repayment term one at a time, then compare the monthly payment with total interest. For '+calcTitleForFaq+', check '+calcInputsText+'. Confirm whether the lender rate is fixed or floating and review processing fees, reset rules and prepayment charges in the actual loan documents.',
    banking:'Test the deposit amount, interest rate, term and compounding convention. For '+calcTitleForFaq+', the inputs include '+calcInputsText+'. Confirm whether the bank pays interest monthly, quarterly or at maturity, and check premature-withdrawal rules; the estimate does not replace the deposit contract.',
    retirement:'Stress-test contributions, investment horizon, expected return and withdrawal assumptions. For '+calcTitleForFaq+', review '+calcInputsText+'. Inflation, longevity, taxes, fees and annuity terms can change retirement income, so compare several scenarios and verify current scheme rules with the relevant regulator or provider.',
    salary:'Verify the pay period, paid hours, workweek and local employment rules. For '+calcTitleForFaq+', check '+calcInputsText+'. Overtime eligibility, leave, bonuses and deductions depend on jurisdiction and employer policy; this arithmetic estimate is not a legal wage determination.',
    business:'Separate direct costs from overhead and test how revenue, price and cost changes affect the result. For '+calcTitleForFaq+', check '+calcInputsText+'. Confirm whether the figure represents gross or net margin; taxes, financing costs and one-off expenses may not be included.',
    tax:'Confirm the tax year, jurisdiction, filing status and eligibility of every deduction or credit before relying on an estimate. For '+calcTitleForFaq+', verify '+calcInputsText+'. Tax rates and thresholds change, so use the linked tax authority guidance and current forms to validate your inputs.',
    planning:'Use assumptions that match the country, period and household or business context. For '+calcTitleForFaq+', review '+calcInputsText+'. Compare more than one scenario and remember that a published index or average may not match your personal costs or circumstances.'
  };
  const faqAnswer=categoryFaqAnswers[calcCategoryForFaq]||('For '+calcTitleForFaq+', test the main inputs one at a time and compare a conservative and an optimistic case. The calculator applies the formula shown on this page; verify local rules, product terms, fees and tax treatment separately.');
  const escapeCalcFaq=value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const faqSecondAnswers={
    investment:'For '+calcTitleForFaq+', the biggest changes usually come from the assumed return, investment duration and contribution size. The labels on this page are '+calcInputsText+'. Change one assumption at a time and compare the ending value with the amount contributed; a higher projection is not a guaranteed return.',
    loan:'For '+calcTitleForFaq+', the interest rate and repayment term often change both the monthly payment and total borrowing cost. The inputs on this page include '+calcInputsText+'. Compare total interest as well as affordability, and confirm whether the quoted rate can reset.',
    banking:'For '+calcTitleForFaq+', the deposit amount, rate, term and compounding frequency can change the maturity estimate. The inputs on this page include '+calcInputsText+'. Match the bank statement or product illustration for the actual crediting convention.',
    retirement:'For '+calcTitleForFaq+', contribution size, time remaining, return and withdrawal assumptions can materially change the projection. The inputs on this page include '+calcInputsText+'. Test a lower-return and higher-inflation case before treating a target as affordable.',
    salary:'For '+calcTitleForFaq+', pay rate, paid hours and the number of working weeks are key drivers. The inputs on this page include '+calcInputsText+'. Check unpaid leave, bonuses, deductions and local overtime rules before comparing the estimate with a payslip.',
    business:'For '+calcTitleForFaq+', revenue, direct costs and overhead assumptions drive the result. The inputs on this page include '+calcInputsText+'. Separate one-off expenses from recurring costs and use the same accounting period for every value.',
    tax:'For '+calcTitleForFaq+', taxable income, eligible deductions, filing status and the applicable tax year can change the estimate. The inputs on this page include '+calcInputsText+'. Confirm each item against current tax-authority rules before relying on a comparison.',
    planning:'For '+calcTitleForFaq+', the result is most sensitive to the assumptions that describe your time period, costs and rates. The inputs on this page include '+calcInputsText+'. Test a second set of assumptions that reflects a less favourable but plausible case.'
  };
  const faqThirdAnswers={
    investment:'No. '+calcTitleForFaq+' is a mathematical scenario and does not automatically include market volatility, fund expenses, tax on gains, inflation or the timing of actual returns unless those items are explicit inputs.',
    loan:'No. '+calcTitleForFaq+' is not a lender quote and may not include processing fees, insurance, taxes, prepayment charges, rate-reset clauses or lender-specific rounding. Read the loan agreement and repayment schedule.',
    banking:'No. '+calcTitleForFaq+' may not include tax withholding, premature-closure penalties, special deposit conditions or every bank-specific compounding rule. Check the current deposit receipt and terms for the product you plan to use.',
    retirement:'No. '+calcTitleForFaq+' cannot determine scheme eligibility, future policy changes, insurer annuity pricing, tax treatment, longevity or every fee. Confirm current scheme rules and obtain provider illustrations before acting.',
    salary:'No. '+calcTitleForFaq+' does not decide legal employee status, statutory overtime eligibility, benefits, leave entitlement or payroll deductions. Those depend on local law, contract terms and employer policy.',
    business:'No. '+calcTitleForFaq+' does not replace financial statements or accounting advice. Inventory valuation, depreciation, financing, tax, cash-flow timing and one-off costs can change the business result.',
    tax:'No. '+calcTitleForFaq+' is a simplified planning estimate, not tax-return software. It does not verify documents, filing eligibility, every deduction or the complete rules for every jurisdiction and tax year.',
    planning:'No. '+calcTitleForFaq+' is an estimate based on selected assumptions. It cannot represent every household, location, price basket, contract or unexpected expense; use current local data for a decision.'
  };
  const faqFourthAnswers={
    investment:'For '+calcTitleForFaq+', compare scenarios using the same starting balance, contribution schedule and time horizon. Change the return assumption separately, then add fees and inflation as separate checks. This avoids confusing a larger contribution with a better investment return.',
    loan:'For '+calcTitleForFaq+', keep the principal and repayment term constant while comparing interest rates or prepayment choices. Review monthly affordability, total interest and upfront fees together; a lower EMI can still mean a higher lifetime cost if the term is longer.',
    banking:'For '+calcTitleForFaq+', compare deposits with the same principal and tenure, then check the effect of compounding frequency and premature-withdrawal rules. Compare the amount actually payable after any applicable tax rather than relying only on the headline rate.',
    retirement:'For '+calcTitleForFaq+', hold the retirement date and contribution schedule constant while testing return, inflation and withdrawal-rate scenarios. Also compare an earlier and later retirement date; a target that works only under the most optimistic assumptions is not robust.',
    salary:'For '+calcTitleForFaq+', compare the same annual gross pay across paid weeks and actual hours, then account for overtime and unpaid leave separately. Keep benefits and deductions visible so that an hourly equivalent is not mistaken for take-home pay.',
    business:'For '+calcTitleForFaq+', compare realistic price, volume and cost combinations over the same accounting period. Identify the break-even point, then test what happens if sales fall or input costs rise; do not mix gross margin with net profit.',
    tax:'For '+calcTitleForFaq+', compare only scenarios that use the same tax year, jurisdiction and filing status. Change one eligible deduction or regime assumption at a time, then verify the result against the current tax authority rules and forms.',
    planning:'For '+calcTitleForFaq+', build a base case, a favourable case and a downside case using the same time period. Change one major assumption at a time and compare the difference with current local data rather than relying on a single average.'
  };
  const faqFifthAnswers={
    investment:'Recalculate '+calcTitleForFaq+' when the contribution amount, investment horizon, fees, tax treatment or expected return changes. Review the assumptions periodically and whenever your goal date changes; do not carry an old return assumption forward as though it were guaranteed.',
    loan:'Recalculate '+calcTitleForFaq+' when the lender changes the rate, you make an extra repayment, the term changes or a fee is added. For a floating-rate loan, use the lender notice and updated repayment schedule rather than assuming the old EMI remains valid.',
    banking:'Recalculate '+calcTitleForFaq+' when the bank changes the deposit rate, tenure, renewal terms or compounding method. Check the maturity date and any tax withholding or early-closure rule before comparing the new estimate with an older deposit receipt.',
    retirement:'Recalculate '+calcTitleForFaq+' after a change in contributions, retirement date, expected pension, inflation assumption or withdrawal plan. A periodic review is useful because small changes in the time horizon and withdrawal rate can materially affect the amount available later.',
    salary:'Recalculate '+calcTitleForFaq+' when pay, scheduled hours, paid weeks, overtime, leave or employment terms change. Keep the pay frequency and currency consistent, and verify statutory overtime or minimum-wage rules with the authority for your jurisdiction.',
    business:'Recalculate '+calcTitleForFaq+' after changes in selling price, sales volume, supplier costs, staffing, rent or the period being measured. Update actual figures from the latest accounts; forecasts should be labelled separately from realised performance.',
    tax:'Recalculate '+calcTitleForFaq+' whenever the tax year, jurisdiction, income, filing status or eligible deductions change. Tax thresholds and rules can change between years, so never reuse last year’s assumptions without checking current official guidance.',
    planning:'Recalculate '+calcTitleForFaq+' when the country, local price data, planning period, household costs or target date changes. Record the date and source of each major assumption so the result can be refreshed consistently.'
  };
  const faqType=calcCategoryForFaq;
  const faqEntries=[
    ['How should I stress-test '+calcTitleForFaq+' results?',faqAnswer],
    ['Which inputs can move the '+calcTitleForFaq+' result most?',faqSecondAnswers[faqType]||faqSecondAnswers.planning],
    ['What does the '+calcTitleForFaq+' estimate leave out?',faqThirdAnswers[faqType]||faqThirdAnswers.planning],
    ['How should I compare two '+calcTitleForFaq+' scenarios?',faqFourthAnswers[faqType]||faqFourthAnswers.planning],
    ['When should I recalculate the '+calcTitleForFaq+' estimate?',faqFifthAnswers[faqType]||faqFifthAnswers.planning]
  ];
  const extraFaqs=faqEntries.map((item,index)=>'<div class="faq-item" data-wa-extra-faq="'+(index+1)+'"><h3>'+escapeCalcFaq(item[0])+'</h3><p>'+escapeCalcFaq(item[1])+'</p></div>').join('');
  if(!html.includes('data-wa-extra-faq="1"')){
    const faqHeading='<h2>Frequently asked questions</h2>';
    const faqHeadingIndex=html.indexOf(faqHeading);
    if(faqHeadingIndex>=0){const insertAt=faqHeadingIndex+faqHeading.length;html=html.slice(0,insertAt)+extraFaqs+html.slice(insertAt);}
    else{const articleEnd=html.indexOf('</article>');if(articleEnd>=0)html=html.slice(0,articleEnd)+faqHeading+extraFaqs+html.slice(articleEnd);}
  }
  const formulaForValidation=calcDefinition?.obj.match(/\bformula:\s*["']([^"']+)["']/)?.[1]||'the formula explained in the methodology section';
  const validationParagraphs={
    investment:[
      'For '+calcTitleForFaq+', first confirm that '+calcInputsText+' match the actual investment schedule and goal date. Check whether contributions are monthly or annual, whether the return is nominal or effective, and whether the timing is at the beginning or end of each period. The method shown for this calculator is '+formulaForValidation+'.',
      'Run a conservative, central and optimistic return case while keeping the contribution pattern unchanged. Treat the lower case as a stress test, not a guarantee, and do not select an assumed return only because it reaches a desired target. Separate the amount invested from projected growth, then account for fees, taxes and inflation.',
      'Check whether '+calcTitleForFaq+' assumes a constant return and uninterrupted contributions. Real portfolios move unevenly; market losses, missed contributions, withdrawals and product charges can change the realised outcome. Use current scheme and provider documents for fees, restrictions and tax treatment rather than treating a calculator output as a product quote.',
      'For a reproducible decision, record the values, date, currency and source used for every major assumption in '+calcTitleForFaq+'. Re-run the calculation when contributions, the target date, charges or the plan changes. The result is a planning scenario, not a promise of investment performance or a recommendation to buy a particular product.'
    ],
    loan:[
      'Before relying on '+calcTitleForFaq+', verify that '+calcInputsText+' match the lender illustration. Confirm the principal outstanding, whether the interest rate is annual or monthly, the repayment frequency and the remaining term. The method shown for this calculator is '+formulaForValidation+'. A mismatch in rate units or payment timing can materially change the estimate.',
      'Compare at least three rate cases using the same principal and term. Review the monthly instalment and the total interest together; a lower instalment can simply reflect a longer repayment period. If the loan has a floating rate, test a plausible upward reset rather than assuming today’s rate remains unchanged.',
      'Check what '+calcTitleForFaq+' does not include, such as processing charges, insurance, taxes, late fees, prepayment penalties or lender-specific rounding. The actual repayment schedule and loan agreement take precedence over an online estimate. Ask the lender how rate resets, payment dates and extra repayments are applied.',
      'Keep the lender quote date, rate type, repayment term and all inputs used in '+calcTitleForFaq+'. Recalculate after a rate reset, partial prepayment, tenure change or fee revision. This makes it possible to compare the new schedule with the original offer without confusing a changed assumption with a calculation error.'
    ],
    banking:[
      'For '+calcTitleForFaq+', check that '+calcInputsText+' reflect the exact deposit product and tenure. Confirm the bank’s compounding frequency, interest-crediting dates and whether the quoted rate is annual. The method shown for this calculator is '+formulaForValidation+'. A bank may use product-specific day-count or rounding conventions that differ from a simple estimate.',
      'Compare the same deposit under the bank’s stated compounding convention and at least one alternative rate. Check the maturity value and the amount available if the deposit is closed early. A headline rate is not the same as the net amount received after applicable tax withholding or penalties.',
      'Verify the terms that '+calcTitleForFaq+' cannot infer, including premature-withdrawal rules, automatic renewal, minimum balance, tax deduction and any special eligibility condition. Use the current deposit receipt and official bank schedule. If the product is not a standard fixed or recurring deposit, confirm its calculation method directly with the provider.',
      'Record the bank, product name, rate, start date, maturity date and input values used in '+calcTitleForFaq+'. Recalculate when the bank changes a renewal rate or the deposit is renewed, extended or closed early. Keep the estimate separate from the bank’s contractual maturity instruction.'
    ],
    retirement:[
      'For '+calcTitleForFaq+', validate '+calcInputsText+' against the actual contribution plan, expected retirement date and scheme rules. Check whether the return is before or after fees, whether contributions rise over time and whether withdrawals begin immediately or later. The method shown for this calculator is '+formulaForValidation+'.',
      'Compare a lower-return case, a higher-inflation case and a later-life withdrawal case. A retirement target should not depend on one optimistic assumption. Review both the projected balance and the sustainable withdrawal amount; a large account value does not automatically mean the income will last throughout retirement.',
      'Check whether '+calcTitleForFaq+' includes annuity pricing, scheme eligibility, contribution limits, taxes, management charges or survivor benefits. These depend on the pension scheme, provider and jurisdiction. Verify current NPS, EPF or other pension rules with the relevant official regulator before using an estimate to choose a contribution or withdrawal option.',
      'Keep the contribution schedule, retirement age, return assumption, inflation rate and withdrawal plan used in '+calcTitleForFaq+'. Revisit the estimate after a material salary or contribution change, a scheme-rule update or a change to the retirement date. A dated set of assumptions makes annual reviews meaningfully comparable.'
    ],
    salary:[
      'For '+calcTitleForFaq+', confirm '+calcInputsText+' against the employment contract and actual work pattern. Check whether the pay figure is gross or net, whether hours are paid hours, and how many weeks are paid in the year. The method shown for this calculator is '+formulaForValidation+'. Keep pay frequency and currency consistent.',
      'Compare a normal week with a week that includes overtime, unpaid leave or a public holiday. Do not assume every hour is paid at the same rate. If you are comparing annual salary with hourly pay, account for paid leave, bonuses and the number of working weeks rather than multiplying by a standard week without checking.',
      'Check which items '+calcTitleForFaq+' excludes, such as tax, pension deductions, insurance, employer benefits and statutory overtime eligibility. Those rules differ by country and employment status. Use the official labour authority guidance for your jurisdiction and the employer’s payroll policy before treating the estimate as a legal entitlement or take-home amount.',
      'Save the pay period, hours, paid weeks, overtime assumption and date used in '+calcTitleForFaq+'. Recalculate after a pay rise, schedule change, new contract or change in overtime. Keeping the original assumptions helps explain why a payslip or annual equivalent differs from an earlier estimate.'
    ],
    business:[
      'For '+calcTitleForFaq+', verify '+calcInputsText+' against the same accounting period and source records. Separate revenue from cash received, direct costs from overhead and recurring costs from one-off purchases. The method shown for this calculator is '+formulaForValidation+'. Mixing monthly sales with annual costs can make a margin or break-even result misleading.',
      'Build a base case and a downside case by changing sales volume, selling price and variable cost separately. Check the break-even point as well as the headline margin. A business that appears profitable at the current volume may have little room for lower demand, supplier increases or customer discounts.',
      'Check whether '+calcTitleForFaq+' excludes taxes, financing charges, depreciation, inventory changes, payment delays or owner compensation. These items can change accounting profit and cash flow in different ways. Use consistent definitions for gross margin, contribution margin and net profit, and reconcile the estimate with the business’s own accounts.',
      'Record the period, data source, cost definitions and assumptions used in '+calcTitleForFaq+'. Recalculate after changes to pricing, staffing, rent, supplier terms or sales volume. Label forecasts separately from actual results so that an optimistic plan is not mistaken for realised business performance.'
    ],
    tax:[
      'Before using '+calcTitleForFaq+', confirm '+calcInputsText+' for the correct jurisdiction, tax year and filing status. Check whether income is taxable, exempt or subject to a separate rate, and distinguish deductions from rebates or credits. The method shown for this calculator is '+formulaForValidation+'. Do not combine thresholds from different tax years.',
      'Compare scenarios using the same income, tax year and eligibility assumptions. If you compare tax regimes, change the regime while keeping the underlying facts constant, then check the total liability rather than only one deduction. A result that changes because the tax year changed is not a valid like-for-like comparison.',
      'Check whether '+calcTitleForFaq+' includes surcharge, cess, local taxes, capital-gain rules, employer benefits, loss offsets or documentation requirements. A calculator cannot validate the evidence needed for a tax return. Use current official tax-authority instructions and forms, especially when a new law or assessment year applies.',
      'Keep the tax year, jurisdiction, filing status, income breakdown and source documents used in '+calcTitleForFaq+'. Recalculate when income, deductions, residence, filing status or legislation changes. Treat the result as a planning estimate and verify it against the current official portal before filing or making a payment.'
    ],
    planning:[
      'For '+calcTitleForFaq+', define the country, location, time period and unit for '+calcInputsText+' before comparing values. Check whether the amounts are nominal or inflation-adjusted and whether the period is monthly, annual or one-off. The method shown for this calculator is '+formulaForValidation+'.',
      'Use a base case and a downside case rather than relying on one average. Change the main rate or cost assumption separately and compare the impact on the target. An official index can describe a broad population, but it may not match your household, city, spending pattern or personal timing.',
      'Check which real-world details '+calcTitleForFaq+' does not model, such as local taxes, contract terms, fees, seasonality or irregular expenses. Use current local data and the relevant public authority for your country. Do not assume that an average inflation rate or market benchmark applies equally to every category.',
      'Record the date, geography, period, data source and assumptions used in '+calcTitleForFaq+'. Recalculate when prices, rates, household costs or the target date change. Keeping a dated baseline helps you distinguish a genuine change in circumstances from a change caused only by different assumptions.'
    ]
  };
  const validationText=validationParagraphs[calcCategoryForFaq]||validationParagraphs.planning;
  if(!html.includes('WA-CALCULATOR-VALIDATION-NOTES')){
    const validationBlock='<!-- WA-CALCULATOR-VALIDATION-NOTES --><section class="calculator-validation-notes"><h2>How to validate '+escapeCalcFaq(calcTitleForFaq)+' before acting</h2>'+validationText.map(paragraph=>'<p>'+escapeCalcFaq(paragraph)+'</p>').join('')+'</section>';
    html=html.replace(/<\/article>/i,validationBlock+'</article>');
  }
  const calculatorSources=sourceSetForCalculator(calcDefinition?.obj||'');
  if(!html.includes('WA-CALCULATOR-AUTHORITATIVE-SOURCES')){
    const sourceItems=calculatorSources.map(item=>'<li><a href="'+item.url+'" rel="noopener noreferrer">'+item.name+'</a> — '+item.reason+'</li>').join('');
    const sourceBlock='<!-- WA-CALCULATOR-AUTHORITATIVE-SOURCES --><section class="calculator-sources" id="calculator-sources" aria-labelledby="calculator-sources-title"><h2 id="calculator-sources-title">Official references and further reading</h2><p>For '+escapeCalcFaq(calcTitleForFaq)+', these official references provide background for the concepts or rules related to this calculator. Some links describe country-specific requirements; use the relevant authority for your own jurisdiction. They are not product recommendations.</p><ul>'+sourceItems+'</ul></section><p class="content-updated"><strong>Last updated:</strong> <time datetime="2026-11-19">19 November 2026</time></p>';
    html=html.replace(/<\/article>/i,sourceBlock+'</article>');
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
    {"@type":"SoftwareApplication","name":titleMatch?.[1]||"Financial Calculator","applicationCategory":"FinanceApplication","operatingSystem":"Any","isAccessibleForFree":true,"description":seoDescription,"url":schemaUrl,"offers":{"@type":"Offer","price":"0","priceCurrency":pageLocale==='en_IN'?'INR':'USD'}},
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
function sourceSetForCalculator(calcObject){
  const category=calcObject.match(/\bcategory:\s*["']([^"']+)["']/)?.[1]||'general';
  const slug=calcObject.match(/\bslug:\s*["']([^"']+)["']/)?.[1]||'';
  const keys={investment:['investment'],loan:['loans','banking'],banking:['banking'],retirement:['retirement','inflation'],salary:['salary'],business:['business'],planning:['planning','inflation'],tax:['tax']};
  const selected=(/(?:tax|gst|hra)/i.test(slug)?sourceRegistry.tax:(keys[category]||['general']).flatMap(key=>sourceRegistry[key]||[]));
  return selected.filter((item,index,all)=>all.findIndex(other=>other.url===item.url)===index);
}
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
        if(!data.image)data.image="https://wealtharrays.com/og-card.svg";
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
        const data={"@context":"https://schema.org","@type":"Article","headline":title,"description":description,"author":{"@type":"Person","name":"Alok Goyal","url":"https://wealtharrays.com/about"},"publisher":{"@type":"Organization","name":"Wealth Arrays","url":"https://wealtharrays.com/","logo":"https://wealtharrays.com/favicon-v2.svg"},"datePublished":date,"dateModified":date,"mainEntityOfPage":canonical||undefined,"image":"https://wealtharrays.com/og-card.svg"};
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
const unique=[...new Set(routes)].filter(u=>{let rel;if(u==='/')rel='index.html';else if(u==='/tools')rel='tools.html';else if(u.startsWith('/articles/'))rel='articles/'+u.slice('/articles/'.length)+'.html';else rel=u.replace(/^\//,'').replace(/\/$/,'')+'/index.html';const file=path.join(root,rel);if(!fs.existsSync(file))return true;const page=fs.readFileSync(file,'utf8');return !/<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(page);});const sitemap=['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',...unique.map(u=>`  <url><loc>https://wealtharrays.com${u}</loc></url>`),'</urlset>',''].join('\n');fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap,'utf8');console.log(`Root-cause build complete: canonical site search, calculator search, current favicon, ${definitions.length} split definitions, normalized calculator IDs, legacy route aliases, nested route support, absolute styles, CLS reservation, page-specific guides, metadata and schema, thin-page noindex/ad guard, indexable-only sitemap, ${allHtml.length} HTML files normalized.`);;
