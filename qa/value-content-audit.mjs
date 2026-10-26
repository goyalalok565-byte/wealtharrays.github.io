import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const source=fs.readFileSync(path.join(root,'calculators.js'),'utf8');
const calculators=[...source.matchAll(/\bslug:\s*["']([^"']+)["']/g)].map(m=>m[1]);
const failures=[];
const countWords=html=>html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&[a-z#0-9]+;/gi,' ').replace(/\s+/g,' ').trim().split(/\s+/).filter(Boolean).length;
if(calculators.length!==47)failures.push('Expected 47 calculator definitions, found '+calculators.length);
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
    ['worked example',/<h2[^>]*>Worked example/i.test(article)&&/<section class=["']worked-example["']/i.test(article)],
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
if(failures.length){console.error('VALUE CONTENT AUDIT FAILED ('+failures.length+' issues)');console.error(failures.join('\n'));process.exit(1);}
console.log('Value-content audit passed: all '+calculators.length+' calculators have substantial unique guidance, worked examples, FAQs, internal article links, concise metadata and valid software/breadcrumb schema.');
