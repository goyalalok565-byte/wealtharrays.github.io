import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';

const root=process.cwd();
const dist=path.join(root,'dist');
assert.ok(fs.existsSync(dist),'dist/ must exist after the production build');
const gitignore=fs.readFileSync(path.join(root,'.gitignore'),'utf8');
assert.equal(fs.readdirSync(root).filter(name=>name.toLowerCase().endsWith('.zip')).length,0,'Source ZIP archives must not be present in the repository root');
assert.match(gitignore,/(^|\n)\*\.zip(\n|$)/,'*.zip must be ignored in Git');
const forbiddenDirs=['.github','qa','scripts','docs','tests','functions','migrations','node_modules','country-modules','api','p','privacy','reports'];
for(const dir of forbiddenDirs)assert.ok(!fs.existsSync(path.join(dist,dir)),`Internal directory leaked into dist/: ${dir}/`);
const files=[];
function walk(dir,rel=''){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const next=path.join(rel,entry.name),full=path.join(dir,entry.name);
    if(entry.isDirectory())walk(full,next);else files.push(next.replaceAll(path.sep,'/'));
  }
}
walk(dist);
for(const file of files){
  assert.ok(!/\.(zip|bak|old|orig|md)$/i.test(file),`Internal archive/document leaked into dist/: ${file}`);
  assert.notEqual(file,'package.json','package.json must not be deployed');
  assert.notEqual(file,'calculator-value-content.json','Build-only calculator-value-content.json must not be deployed');
}
for(const file of ['index.html','tools.html','robots.txt','sitemap.xml','ads.txt','llms.txt','manifest.webmanifest','_headers','_redirects','sw.js','offline.html','widget.html','widget/index.html','widget.js','widget-bootstrap.js','search-loader.js','calculators.js','wa-site-runtime.js','wa-home-runtime.js','wa-calculator-runtime.js','favicon.svg','og-image.png','icon-192.png','icon-512.png','.well-known/security.txt']){
  assert.ok(fs.existsSync(path.join(dist,file)),`Required production file missing from dist/: ${file}`);
}
const htmlFiles=files.filter(file=>file.endsWith('.html'));
for(const file of htmlFiles){
  const html=fs.readFileSync(path.join(dist,file),'utf8');
  const cssLinks=[...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+\\.css)["'][^>]*>/gi)].map(match=>match[1]);
  assert.equal(cssLinks.length,1,`${file}: expected exactly one page-type stylesheet, found ${cssLinks.length}`);
  const cssPath=path.join(dist,cssLinks[0].replace(/^\\//,''));
  assert.ok(fs.existsSync(cssPath),`${file}: stylesheet asset missing: ${cssLinks[0]}`);
  assert.match(cssLinks[0],/\\.([a-f0-9]{12})\\.css$/,`${file}: stylesheet filename must be content-hashed`);
  assert.ok(gzipSync(fs.readFileSync(cssPath)).length<30*1024,`${file}: CSS exceeds 30 KB gzip budget`);
}
const calculatorPages=files.filter(file=>/^[^/]+\/index\.html$/.test(file)&&fs.readFileSync(path.join(dist,file),'utf8').includes('data-wa-calculator='));
for(const file of calculatorPages){
  const html=fs.readFileSync(path.join(dist,file),'utf8');
  assert.ok(html.includes('/calculator-definitions/'),`${file}: split calculator definition missing`);
  assert.ok(!html.includes('/calculators.js'),`${file}: all-calculator catalog must not load on calculator routes`);
  assert.ok(!html.includes('calculator-value-content.json'),`${file}: build-only content JSON must not load at runtime`);
}
assert.ok(!fs.existsSync(path.join(dist,'og-card.svg')),'Retired SVG social preview must not be deployed');
assert.ok(calculatorPages.length>=47,`Expected at least 47 calculator routes in dist/, found ${calculatorPages.length}`);
console.log(`Deploy hygiene PASS — ${files.length} public files, ${calculatorPages.length} calculator routes; internal source/test/build files and archives excluded.`);
