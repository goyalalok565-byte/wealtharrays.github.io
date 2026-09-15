import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const htmlFiles = [];
function walk(dir){
  for(const name of fs.readdirSync(dir)){
    if(name.startsWith('.') && name !== '.well-known') continue;
    const full=path.join(dir,name), st=fs.statSync(full);
    if(st.isDirectory()) walk(full);
    else if(name.endsWith('.html')) htmlFiles.push(full);
  }
}
walk(root);

const phase4Css='<link rel="stylesheet" href="/phase4-premium.css?v=20260915-1">';
const phase4Js='<script src="/phase4-premium.js?v=20260915-1" defer></script>';
const themeJs='<script src="/theme-init.js?v=20260915-1"></script>';
let changed=0;
for(const file of htmlFiles){
  let s=fs.readFileSync(file,'utf8');
  const before=s;
  s=s.replace(/<script>document\.documentElement\.dataset\.theme=localStorage\.waTheme\|\|['"]light['"]<\/script>/g, themeJs);
  s=s.replace(/<link rel="stylesheet" href="\/phase4-premium\.css[^>]*>/g,'');
  s=s.replace(/<script src="\/phase4-premium\.js[^>]*><\/script>/g,'');
  if(!s.includes('/phase4-premium.css')) s=s.replace('</head>',`${phase4Css}</head>`);
  if(!s.includes('/phase4-premium.js')) s=s.replace('</body>',`${phase4Js}</body>`);
  if(!s.includes('name="referrer"')) s=s.replace('<meta name="viewport"', '<meta name="referrer" content="strict-origin-when-cross-origin"><meta name="viewport"');
  if(s!==before){fs.writeFileSync(file,s);changed++;}
}
console.log(`Phase 4 premium build updated ${changed} HTML files (${htmlFiles.length} scanned).`);
