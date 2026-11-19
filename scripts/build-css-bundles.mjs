import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { gzipSync } from 'node:zlib';

const root=process.cwd();
const dist=path.join(root,'dist');
if(!fs.existsSync(dist))throw new Error('dist/ is missing; run build-dist.mjs first');

const common=['styles.css','phase3-seo.css','cls-fixes.css'];
const pageSources={
  home:[...common,'homepage-refresh.css','phase4-premium.css'],
  tools:[...common,'tool-library-refresh.css','phase4-premium.css'],
  calculator:[...common,'phase4-premium.css'],
  article:[...common,'phase4-premium.css'],
  legal:[...common,'legal-pages-responsive.css','phase4-premium.css'],
  app:[...common,'money-pages-responsive.css','phase4-premium.css'],
  static:[...common,'phase4-premium.css']
};
const source=(name)=>fs.readFileSync(path.join(root,name),'utf8').replace(/\r\n/g,'\n').trim();
const outputs={};
for(const [type,files] of Object.entries(pageSources)){
  const css=files.map(source).join('\n');
  const gzipBytes=gzipSync(css,{level:9}).length;
  if(gzipBytes>30*1024)throw new Error(`${type} CSS gzip budget exceeded: ${gzipBytes} bytes`);
  const hash=crypto.createHash('sha256').update(css).digest('hex').slice(0,12);
  const filename=`wa-${type}.${hash}.css`;
  fs.writeFileSync(path.join(dist,filename),css);
  outputs[type]={filename,gzipBytes,rawBytes:Buffer.byteLength(css),files};
}

function pageType(rel,html){
  if(rel==='index.html'||html.includes('class="ledger-hero"'))return 'home';
  if(html.includes('data-wa-calculator=')||rel==='widget.html'||rel==='widget/index.html'||rel.startsWith('widget/'))return 'calculator';
  if(rel==='tools.html'||html.includes('class="tools-page"')||rel==='tools/index.html')return 'tools';
  if(rel.startsWith('articles/')||html.includes('class="article-page"'))return 'article';
  if(html.includes('legal-content-page')||/(?:^|\/)(?:privacy|terms|disclaimer|about|contact|faq|methodology|editorial-policy|advertising-policy)(?:\.html|\/index\.html)$/.test(rel))return 'legal';
  if(/(?:financial-workspace|goal-planner|scenario-lab|advanced-finance-tools)/.test(rel))return 'app';
  return 'static';
}

const htmlFiles=[];
function walk(dir,rel=''){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const next=path.join(rel,entry.name),full=path.join(dir,entry.name);
    if(entry.isDirectory())walk(full,next);
    else if(entry.name.endsWith('.html'))htmlFiles.push(next.replaceAll(path.sep,'/'));
  }
}
walk(dist);
const cssLinkPattern=/^<link\b[^>]*>$/i;
for(const rel of htmlFiles){
  const full=path.join(dist,rel);
  let html=fs.readFileSync(full,'utf8');
  const type=pageType(rel,html),asset=outputs[type].filename;
  html=html.replace(/<link\b[^>]*>/gi,tag=>{
    if(!cssLinkPattern.test(tag))return tag;
    const relAttr=tag.match(/\brel\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase()||'';
    const href=tag.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1]||'';
    if(!/\.css(?:[?#]|$)/i.test(href))return tag;
    if(relAttr==='stylesheet')return '';
    if(relAttr==='preload'&&/\bas\s*=\s*["']style["']/i.test(tag))return '';
    return tag;
  });
  const links=`<link rel="preload" as="style" href="/${asset}"><link rel="stylesheet" href="/${asset}">`;
  if(!/<head\b[^>]*>/i.test(html))throw new Error(`${rel}: missing head element`);
  html=html.replace(/<head\b[^>]*>/i,match=>match+links);
  fs.writeFileSync(full,html);
}
const retired=['styles.css','phase3-seo.css','cls-fixes.css','phase4-premium.css','homepage-refresh.css','tool-library-refresh.css','legal-pages-responsive.css','money-pages-responsive.css'];
for(const file of retired)fs.rmSync(path.join(dist,file),{force:true});

// The service worker precaches only the real page-type CSS assets. A content-derived
// cache version ensures old CSS caches are retired when any page bundle changes.
const cssAssets=Object.values(outputs).map(item=>'/'+item.filename);
const cssHash=crypto.createHash('sha256').update(cssAssets.join('|')).digest('hex').slice(0,10);
const swPath=path.join(dist,'sw.js');
let sw=fs.readFileSync(swPath,'utf8');
sw=sw.replace(/const VERSION='[^']+';/,`const VERSION='wealtharrays-pwa-${cssHash}';`);
sw=sw.replace(/const STATIC_ASSETS=\[[^;]+\];/,`const STATIC_ASSETS=['/offline.html','/theme-init.js','/wa-site-runtime.js','/wa-home-runtime.js','/wa-calculator-runtime.js',${cssAssets.map(asset=>JSON.stringify(asset)).join(',')}];`);
fs.writeFileSync(swPath,sw);

console.log('CSS bundles:',JSON.stringify(outputs));
console.log(`CSS bundle build PASS — ${htmlFiles.length} HTML files now use one content-hashed stylesheet per page type.`);
