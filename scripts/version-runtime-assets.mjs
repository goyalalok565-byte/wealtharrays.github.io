import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=process.cwd();
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex').slice(0,12);
const RUNTIME_CACHE_EPOCH='20261026-currency-top25-rank1';
const siteVersion=hash('wa-site-runtime.js')+'-'+RUNTIME_CACHE_EPOCH;
const homeVersion=hash('wa-home-runtime.js')+'-'+RUNTIME_CACHE_EPOCH;
const calculatorVersion=hash('wa-calculator-runtime.js')+'-'+RUNTIME_CACHE_EPOCH;
const staticCacheableAssets=[
  'styles.css',
  'phase3-seo.css',
  'phase4-premium.css',
  'cls-fixes.css',
  'homepage-refresh.css',
  'theme-init.js',
  'homepage-business.js',
  'homepage-search.js',
  'consent-loader.js',
  'wa-ad-loader.js'
];
const staticVersions=new Map(staticCacheableAssets.map(file=>[file,hash(file)]));
const htmlFiles=[];
const walk=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory()){if(!['.git','node_modules','dist'].includes(entry.name))walk(full);}else if(/\.html$/i.test(entry.name))htmlFiles.push(full);}};
walk(root);
let changed=0;
for(const full of htmlFiles){
  let html=fs.readFileSync(full,'utf8');
  const before=html;
  html=html.replace(/\/wa-site-runtime\.js\?v=[^"']+/g,'/wa-site-runtime.js?v='+siteVersion);
  html=html.replace(/\/wa-home-runtime\.js\?v=[^"']+/g,'/wa-home-runtime.js?v='+homeVersion);
  html=html.replace(/\/wa-calculator-runtime\.js\?v=[^"']+/g,'/wa-calculator-runtime.js?v='+calculatorVersion);
  for(const [asset,version] of staticVersions){
    const pattern=new RegExp("(/"+asset.replace(".","\\.")+")(?:\\?v=[^\"']*)?","g");
    html=html.replace(pattern,'$1?v='+version);
  }
  if(html!==before){fs.writeFileSync(full,html,'utf8');changed++;}
}
console.log('Runtime and static asset cache-busting complete — site='+siteVersion+', calculator='+calculatorVersion+', '+staticVersions.size+' static assets versioned, html files updated='+changed+'.');
