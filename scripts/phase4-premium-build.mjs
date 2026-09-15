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
let changed=0;
for(const file of htmlFiles){
  let s=fs.readFileSync(file,'utf8');
  const before=s;
  // Remove inline theme bootstrap and use one CSP-friendly external bootstrap.
  s=s.replace(/<script>[^<]*(?:document\.documentElement\.dataset\.theme|localStorage\.(?:waTheme|getItem\(['"]waTheme['"]\)))[^<]*<\/script>/gi, '');
  if(!s.includes('/theme-init.js')) s=s.replace('</head>',`${themeJs}</head>`);
  // Replace inline calculator mount code with a generic external bootstrap and data attribute.
  const mount=s.match(/<script>[^<]*mountCalculator\(CALCULATORS\.find\(c=>c\.id===?['"]([^'"]+)['"]\),?\s*['"]calc-widget['"]\)[^<]*<\/script>/i);
  if(mount){
    s=s.replace(mount[0],'');
    s=s.replace('<html ',`<html data-wa-calculator="${mount[1]}" `);
    if(!s.includes('/calculator-page-init.js')) s=s.replace('</body>',`${calcInitJs}</body>`);
  }
  // Move the legacy 404 redirect to an external script.
  if(path.basename(file)==='404.html' && /<script>\(function\(\)\{var p=location\.pathname/.test(s)){
    s=s.replace(/<script>\(function\(\)\{var p=location\.pathname[\s\S]*?<\/script>/,'');
    if(!s.includes('/404-runtime.js')) s=s.replace('</head>',`${redirectJs}</head>`);
  }
  s=s.replace(/<link rel="stylesheet" href="\/phase4-premium\.css[^>]*>/g,'');
  s=s.replace(/<script src="\/phase4-premium\.js[^>]*><\/script>/g,'');
  if(!s.includes('/phase4-premium.css')) s=s.replace('</head>',`${phase4Css}</head>`);
  if(!s.includes('/phase4-premium.js')) s=s.replace('</body>',`${phase4Js}</body>`);
  if(!s.includes('name="referrer"')) s=s.replace('<meta name="viewport"', '<meta name="referrer" content="strict-origin-when-cross-origin"><meta name="viewport"');
  if(s!==before){fs.writeFileSync(file,s);changed++;}
}
console.log(`Phase 4 premium build updated ${changed} HTML files (${htmlFiles.length} public HTML files scanned).`);
