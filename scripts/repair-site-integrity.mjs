import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const write=(f,s)=>fs.writeFileSync(path.join(root,f),s,'utf8');

// Repair legacy/static pages that were missing the site's base stylesheet.
for(const name of ['about.html','404.html','privacy-policy.html','editorial-standards.html','income-tax-planner.html','decoding-auto-financing-how-car-loan.html']){
  let s=read(name);
  if(!s.includes('href="/styles.css"') && !s.includes("href='/styles.css'")){
    s=s.replace('<link rel="stylesheet" href="/phase3-seo.css?v=20260915-1">','<link rel="preload" as="style" href="/styles.css"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/phase3-seo.css?v=20260915-1">');
    write(name,s);
  }
}

const redirects={
 'privacy-policy.html':['/privacy.html','Privacy Policy','Redirect to the Wealth Arrays Privacy Policy.'],
 'editorial-standards.html':['/editorial-policy.html','Editorial Standards','Redirect to the Wealth Arrays Editorial Standards.'],
 'income-tax-planner.html':['/income-tax-scenario-calculator.html','Income Tax Scenario Calculator','Redirect to the Wealth Arrays Income Tax Scenario Calculator.'],
 'decoding-auto-financing-how-car-loan.html':['/articles/loan-emi-guide.html','EMI & Loan Payments Guide','Redirect to the Wealth Arrays EMI and Loan Payments Guide.']
};
for(const [name,[target,label,desc]] of Object.entries(redirects)){
  let s=read(name);
  s=s.replace(/content="0;\s*url=[^"]+"/i,`content="0;url=${target}"`);
  s=s.replace(/content='0;\s*url=[^']+'/i,`content='0;url=${target}'`);
  if(!/<meta\s+name=["']description["']/i.test(s)) s=s.replace('</title>',`</title><meta name="description" content="${desc}">`);
  const body=s.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if(body && !/<h1\b/i.test(body[1])){
    const main=`<main class="static-page redirect-shell"><a class="calc-back" href="/">← Home</a><div class="eyebrow" style="margin-top:18px">REDIRECT</div><h1>${label}</h1><p class="calc-desc">This older Wealth Arrays address has moved to the current page.</p><p><a class="calc-back" href="${target}">Continue to ${label} →</a></p></main>`;
    s=s.slice(0,body.index)+`<body>${main}</body>`+s.slice(body.index+body[0].length);
  }
  write(name,s);
}

for(const [name,target,label] of [['cagr/index.html','/cagr-calculator/','CAGR Calculator'],['compound-interest/index.html','/compound-interest-calculator/','Compound Interest Calculator'],['emi-calculator/index.html','/mortgage-emi-calculator/','EMI Calculator']]){
  let s=read(name).replace(/content="0;url=[^"]+"/i,`content="0;url=${target}"`);
  if(!/<meta\s+name=["']description["']/i.test(s)) s=s.replace(`<title>${label}</title>`,`<title>${label}</title><meta name="description" content="Redirect to the current ${label} page on Wealth Arrays.">`);
  s=s.replace(/<p>Redirecting[\s\S]*?<\/p>/i,`<main class="static-page redirect-shell"><div class="eyebrow">REDIRECT</div><h1>${label}</h1><p class="calc-desc">This older Wealth Arrays address has moved to the current calculator route.</p><p><a class="calc-back" href="${target}">Continue →</a></p></main>`);
  write(name,s);
}

let widget=read('widget.html');
if(!/<meta\s+name=["']description["']/i.test(widget)) widget=widget.replace('<title>Wealth Arrays Calculator Widget</title>','<title>Wealth Arrays Calculator Widget</title><meta name="description" content="Embeddable Wealth Arrays calculator widget.">');
if(!/<h1\b/i.test(widget)) widget=widget.replace('<main style="max-width:900px;margin:0 auto;padding:18px">','<main class="static-page" style="max-width:900px;margin:0 auto;padding:18px"><h1>Wealth Arrays Calculator Widget</h1><p class="calc-desc">Embeddable access to the Wealth Arrays calculator library.</p>');
write('widget.html',widget);

let offline=read('offline.html');
if(!/<meta\s+name=["']description["']/i.test(offline)) offline=offline.replace('<title>','<meta name="description" content="Wealth Arrays offline fallback page."><title>');
if(!/rel=["']canonical["']/i.test(offline)) offline=offline.replace('<meta name="robots"','<link rel="canonical" href="https://wealtharrays.com/offline.html"><meta name="robots"');
if(!offline.includes('/phase4-premium.css')) offline=offline.replace('</head>','<link rel="stylesheet" href="/phase4-premium.css?v=20260915-1"><meta name="referrer" content="strict-origin-when-cross-origin"></head>');
write('offline.html',offline);
