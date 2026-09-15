import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const htmlFiles = [];
function walk(dir){
  for(const name of fs.readdirSync(dir)){
    if(name.startsWith('.') || name === 'node_modules') continue;
    const full=path.join(dir,name), st=fs.statSync(full);
    if(st.isDirectory()) walk(full);
    else if(name.endsWith('.html')) htmlFiles.push(full);
  }
}
walk(root);

const phase4Css='<link rel="stylesheet" href="/phase4-premium.css?v=20260915-1">';
const phase4Js='<script src="/phase4-premium.js?v=20260915-1" defer></script>';
const themeJs='<script src="/theme-init.js?v=20260915-1"></script>';
const calcInitJs='<script src="/calculator-page-init.js?v=20260915-1" defer></script>';
const redirectJs='<script src="/404-runtime.js?v=20260915-1" defer></script>';
const adsenseJs='<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6507600103785450" crossorigin="anonymous"></script>';
const calcIds={
 'sip-calculator.html':'sip','compound-interest-calculator.html':'compound-interest','mortgage-emi-calculator.html':'mortgage','roi-calculator.html':'roi','simple-interest-calculator.html':'simple-interest','retirement-calculator.html':'freedom-milestone','salary-to-hourly-calculator.html':'salary-conversion','profit-margin-calculator.html':'profit-margin','fixed-deposit-calculator.html':'fixed-deposit','recurring-deposit-calculator.html':'recurring-deposit','lumpsum-calculator.html':'lumpsum','cagr-calculator.html':'cagr','car-loan-calculator.html':'car-loan','personal-loan-calculator.html':'personal-loan','debt-payoff-calculator.html':'debt-payoff','inflation-calculator.html':'inflation','net-worth-calculator.html':'net-worth','overtime-pay-calculator.html':'overtime','freelance-rate-calculator.html':'freelance-rate','income-tax-scenario-calculator.html':'income-tax-scenario'
};
let changed=0;
for(const file of htmlFiles){
  let s=fs.readFileSync(file,'utf8');
  const before=s;
  s=s.replace(/<script>[^<]*(?:document\.documentElement\.dataset\.theme|localStorage\.(?:waTheme|getItem\(['"]waTheme['"]\)))[^<]*<\/script>/gi, '');
  if(!s.includes('/theme-init.js')) s=s.replace('</head>',`${themeJs}</head>`);
  // Replace every inline calculator bootstrap, including legacy formatting variants.
  const mountId=(s.match(/mountCalculator\(\s*CALCULATORS\.find\(\s*c\s*=>\s*c\.id\s*===\s*['"]([^'"]+)['"]/i)||[])[1];
  if(mountId) s=s.replace(/<script>[^<]*mountCalculator\([^<]*<\/script>/gi,'');
  const base=path.basename(file);
  const canonicalId=calcIds[base];
  const id=canonicalId||mountId;
  if(id && s.includes('id="calc-widget"')){
    s=s.replace(/<html\s+data-wa-calculator="[^"]*"/i,'<html');
    s=s.replace(/<html\s+/,`<html data-wa-calculator="${id}" `);
    if(!s.includes('/calculator-page-init.js')) s=s.replace('</body>',`${calcInitJs}</body>`);
  }
  if(base==='404.html'){
    s=s.replace(/<script>\(function\(\)\{var p=location\.pathname[\s\S]*?<\/script>/,'');
    if(!s.includes('/404-runtime.js')) s=s.replace('</head>',`${redirectJs}</head>`);
  }
  s=s.replace(/<link rel="stylesheet" href="\/phase4-premium\.css[^>]*>/g,'');
  s=s.replace(/<script src="\/phase4-premium\.js[^>]*><\/script>/g,'');
  if(!s.includes('/phase4-premium.css')) s=s.replace('</head>',`${phase4Css}</head>`);
  if(!s.includes('/phase4-premium.js')) s=s.replace('</body>',`${phase4Js}</body>`);
  if(!s.includes('name="referrer"')) s=s.replace('</head>',`<meta name="referrer" content="strict-origin-when-cross-origin"></head>`);
  if(!s.includes('ca-pub-6507600103785450')) s=s.replace('</head>',`${adsenseJs}</head>`);
  if(s!==before){fs.writeFileSync(file,s);changed++;}
}
console.log(`Phase 4 premium build updated ${changed} HTML files (${htmlFiles.length} public HTML files scanned).`);
