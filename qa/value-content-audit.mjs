import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const calculators=[
  'sip-calculator','compound-interest-calculator','mortgage-emi-calculator','roi-calculator','simple-interest-calculator',
  'retirement-calculator','salary-to-hourly-calculator','profit-margin-calculator','fixed-deposit-calculator','recurring-deposit-calculator',
  'lumpsum-calculator','cagr-calculator','car-loan-calculator','personal-loan-calculator','debt-payoff-calculator',
  'inflation-calculator','net-worth-calculator','overtime-pay-calculator','freelance-rate-calculator','income-tax-scenario-calculator'
];
const failures=[];
for(const slug of calculators){
  const file=path.join(root,slug,'index.html');
  if(!fs.existsSync(file)){failures.push(slug+': canonical page missing');continue;}
  const html=fs.readFileSync(file,'utf8');
  const article=html.match(/<article class="tool-article">([\s\S]*?)<\/article>/i)?.[1]||'';
  const text=article.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&[^;]+;/g,' ').replace(/\s+/g,' ').trim();
  const words=text?text.split(/\s+/).length:0;
  const checks=[
    ['500+ educational words',words>=500],
    ['worked example',/worked example/i.test(article)],
    ['FAQ section',/frequently asked questions/i.test(article)],
    ['methodology or limitations',/(methodology|limitations)/i.test(article)],
    ['calculator-specific value guide',/WA-CALCULATOR-VALUE-GUIDE/i.test(html)],
    ['related internal links',((article.match(/<a\b/gi)||[]).length>=2)]
  ];
  for(const [label,ok] of checks)if(!ok)failures.push(slug+': '+label);
}
const htmlFiles=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(['.git','node_modules'].includes(e.name))continue;const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(e.name.endsWith('.html'))htmlFiles.push(p);}}
walk(root);
for(const file of htmlFiles){
  const rel=path.relative(root,file).replaceAll(path.sep,'/');
  if(!/^articles\/[^/]+\.html$/.test(rel))continue;
  const html=fs.readFileSync(file,'utf8');
  for(const json of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)){
    try{JSON.parse(json[1]);}catch{failures.push(rel+': invalid JSON-LD');}
  }
}
if(failures.length){console.error('VALUE CONTENT AUDIT FAILED');console.error(failures.join('\n'));process.exit(1);}
console.log('Value-content audit passed: 20 canonical calculators have substantial educational sections and calculator-specific guidance; article JSON-LD is parseable.');
