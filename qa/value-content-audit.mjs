import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const source=fs.readFileSync(path.join(root,'calculators.js'),'utf8');
const registry=JSON.parse(fs.readFileSync(path.join(root,'calculator-definitions/registry.json'),'utf8'));
const calculators=registry.calculators.map(item=>item.slug);
const failures=[];
const countWords=html=>html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&[a-z#0-9]+;/gi,' ').replace(/\s+/g,' ').trim().split(/\s+/).filter(Boolean).length;
if(calculators.length!==registry.count)failures.push('Expected '+registry.count+' registered calculator definitions, found '+calculators.length);
for(const slug of calculators){
  const file=path.join(root,slug,'index.html');
  if(!fs.existsSync(file)){failures.push(slug+': canonical page missing');continue;}
  const html=fs.readFileSync(file,'utf8');
  const article=html.match(/<article class="tool-article">([\s\S]*?)<\/article>/i)?.[1]||'';
  const words=countWords(article);
  const noindex=/<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
  const ads=/adsbygoogle|pagead2\.googlesyndication\.com|class=["'][^"']*adsbygoogle/i.test(html);
  const title=(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]?.trim()||'';
  const description=(html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)||[])[1]||'';
  const canonical=(html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)||[])[1]||'';
  const checks=[
    ['650+ educational words',words>=650],
    ['worked example with computed result',(()=>{const match=article.match(/<section class=["']worked-example["'][^>]*>([\s\S]*?)<\/section>/i);if(!match||!/<h2[^>]*>Worked example/i.test(match[0]))return false;const text=match[1].replace(/<[^>]+>/g,' ').replace(/&[^;]+;/g,' ');return /\d/.test(text)&&/(?:result|output|total|amount|balance|interest|EMI|GST|corpus|CAGR|net worth|payoff|projected|estimate|target|shortfall|gap|needed|months to|gives|produces|shows|equals|about|approximately|value|tax)/i.test(text);})()],
    ['FAQ section with answers',/frequently asked questions/i.test(article)&&((article.match(/class=["']faq-item["']/gi)||[]).length>=2)],
    ['calculator-specific value guide',/WA-CALCULATOR-VALUE-GUIDE/i.test(html)],
    ['two or more calculator-specific guidance sections',(article.match(/calculator-specific-guidance/g)||[]).length>=2],
    ['related article link',/href=["']\/articles\//i.test(article)],
    ['SoftwareApplication schema',/"@type":"SoftwareApplication"/.test(html)],
    ['BreadcrumbList schema',/"@type":"BreadcrumbList"/.test(html)],
    ['valid JSON-LD',true],
    ['title 70 characters or less',title.length>0&&title.length<=70],
    ['description 70–170 characters',description.length>=70&&description.length<=170],
    ['canonical URL',canonical===`https://wealtharrays.com/${slug}/`],
    ['no generic annual-rate filler',!article.includes('If a field represents an annual rate')],
    ['no generic prediction filler',!article.includes('Do not treat one output as a prediction')]
  ];
  for(const [label,ok] of checks)if(!ok)failures.push(slug+': '+label+(label==='650+ educational words'?' (found '+words+')':''));
  for(const json of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){
    try{JSON.parse(json[1]);}catch{failures.push(slug+': invalid JSON-LD');}
  }
  if(noindex)failures.push(slug+': calculator remains noindex; complete content before indexing');
  if(noindex&&ads)failures.push(slug+': thin/noindex page still contains ad code');
}
const htmlFiles=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(['.git','node_modules','dist'].includes(e.name))continue;const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(e.name.endsWith('.html'))htmlFiles.push(p);}}
walk(root);
for(const file of htmlFiles){
  const rel=path.relative(root,file).replaceAll(path.sep,'/');
  if(!/^articles\/[^/]+\.html$/.test(rel))continue;
  const html=fs.readFileSync(file,'utf8');
  for(const json of html.matchAll(/<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)){
    try{JSON.parse(json[1]);}catch{failures.push(rel+': invalid JSON-LD');}
  }
}

// Keep the SIP Goal worked example tied to the calculator's beginning-of-month model.
// A hand-written end-of-month example previously overstated the required SIP.
const sipGoalExamplePath = path.join(root, 'sip-goal-calculator', 'index.html');
if (!fs.existsSync(sipGoalExamplePath)) {
  failures.push('sip-goal-calculator: generated worked example page missing');
} else {
  const sipGoalHtml = fs.readFileSync(sipGoalExamplePath, 'utf8');
  if (!sipGoalHtml.includes('Required monthly SIP: $6,635.27')) {
    failures.push('sip-goal-calculator: worked example must match the beginning-of-month model output (₹6,635.27).');
  }
  if (sipGoalHtml.includes('$6,691')) {
    failures.push('sip-goal-calculator: stale end-of-month worked example must not be published.');
  }
}


// Regression checks for worked examples whose contribution-timing convention
// must match the calculator implementation.
const stepUpHtml = fs.readFileSync(path.join(root, 'step-up-sip-calculator', 'index.html'), 'utf8');
if (!stepUpHtml.includes('Projected investment value: $4,341,924.72')) {
  failures.push('step-up-sip-calculator: worked example must be generated from the beginning-of-month model (₹43,41,924.72).');
}
if (stepUpHtml.includes('42.99 lakh')) {
  failures.push('step-up-sip-calculator: stale end-of-month worked example must not be published.');
}
const lumpSumSipHtml = fs.readFileSync(path.join(root, 'lumpsum-sip-calculator', 'index.html'), 'utf8');
if (!lumpSumSipHtml.includes('beginning of each month produces about ₹1,26,703')) {
  failures.push('lumpsum-sip-calculator: worked example must match beginning-of-month SIP timing.');
}
if (lumpSumSipHtml.includes('₹1,25,656')) {
  failures.push('lumpsum-sip-calculator: stale end-of-month SIP figure must not be published.');
}

if(failures.length){console.error('VALUE CONTENT AUDIT FAILED ('+failures.length+' issues)');console.error(failures.join('\n'));process.exit(1);}
console.log('Value-content baseline checks passed for '+calculators.length+' registered calculators. See docs/audits/content-quality-audit.md for strict word-count, FAQ, source, updated-date and duplicate-paragraph results.');
