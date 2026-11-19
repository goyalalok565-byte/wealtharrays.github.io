import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { gzipSync } from 'node:zlib';

const dist=path.join(process.cwd(),'dist');
if(!fs.existsSync(dist))throw new Error('dist/ is missing; run build-dist.mjs first');
const hash=text=>crypto.createHash('sha256').update(text).digest('hex').slice(0,12);
const walk=(dir,rel='')=>{
  const files=[];
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const next=path.posix.join(rel,entry.name),full=path.join(dir,entry.name);
    if(entry.isDirectory())files.push(...walk(full,next));
    else files.push(next);
  }
  return files;
};
const jsFiles=walk(dist).filter(file=>file.endsWith('.js')&&file!=='sw.js');
const contents=new Map(jsFiles.map(file=>[file,fs.readFileSync(path.join(dist,file),'utf8')]));
const mapping={};
const makeName=(file,text)=>{
  const dir=path.posix.dirname(file),base=path.posix.basename(file,'.js');
  return path.posix.join(dir,base+'.'+hash(text)+'.js');
};
function rewriteReference(text,oldPath,newPath){
  for(const quote of ['"',"'"]){
    const needle=quote+'/'+oldPath;
    let from=0,index;
    while((index=text.indexOf(needle,from))!==-1){
      const end=text.indexOf(quote,index+needle.length);
      if(end<0)break;
      const suffix=text.slice(index+needle.length,end);
      if(suffix===''||suffix.startsWith('?')){
        const replacement=quote+'/'+newPath+quote;
        text=text.slice(0,index)+replacement+text.slice(end+1);
        from=index+replacement.length;
      }else from=end+1;
    }
  }
  return text;
}

const dependentFiles=new Set(['search-loader.js']);
for(const file of jsFiles){
  if(dependentFiles.has(path.posix.basename(file)))continue;
  mapping[file]=makeName(file,contents.get(file));
}

// Rewrite the only known runtime-to-runtime references before hashing dependent files.
for(const file of jsFiles){
  const base=path.posix.basename(file);
  if(!dependentFiles.has(base))continue;
  let content=contents.get(file);
  const dependencies=['homepage-search.js','calculator-search.js'];
  for(const target of dependencies){
    if(!mapping[target])throw new Error('Missing local JavaScript dependency in dist/: '+target);
    content=rewriteReference(content,target,mapping[target]);
  }
  contents.set(file,content);
  mapping[file]=makeName(file,content);
}

for(const file of jsFiles){
  let content=contents.get(file);
  for(const [oldPath,newPath] of Object.entries(mapping)){
    if(oldPath!==file)content=rewriteReference(content,oldPath,newPath);
  }
  contents.set(file,content);
  const finalName=makeName(file,content);
  if(finalName!==mapping[file])throw new Error('Unresolved JavaScript dependency changed hash for '+file+': expected '+mapping[file]+', got '+finalName);
}

for(const file of jsFiles){
  const destination=path.join(dist,mapping[file]);
  fs.mkdirSync(path.dirname(destination),{recursive:true});
  fs.writeFileSync(destination,contents.get(file));
}
for(const file of jsFiles)fs.rmSync(path.join(dist,file),{force:true});

const rewriteAll=text=>{
  for(const [oldPath,newPath] of Object.entries(mapping))text=rewriteReference(text,oldPath,newPath);
  return text;
};
for(const file of walk(dist).filter(file=>file.endsWith('.html'))){
  const full=path.join(dist,file);
  fs.writeFileSync(full,rewriteAll(fs.readFileSync(full,'utf8')));
}
const swPath=path.join(dist,'sw.js');
let sw=rewriteAll(fs.readFileSync(swPath,'utf8'));
const cssNames=(sw.match(/wa-(?:home|tools|calculator|article|legal|app|static)\.[a-f0-9]{12}\.css/g)||[]).sort();
const cacheHash=hash(Object.values(mapping).sort().join('|')+'|'+cssNames.join('|'));
sw=sw.replace(/const VERSION='[^']+';/,"const VERSION='wealtharrays-pwa-"+cacheHash+"';");
fs.writeFileSync(swPath,sw);

const publicTextFiles=walk(dist).filter(file=>file.endsWith('.html')||file.endsWith('.js'));
for(const file of publicTextFiles){
  const text=fs.readFileSync(path.join(dist,file),'utf8');
  const stale=[...text.matchAll(/(["'])\/([^"']+\.js)\?[^"']*\1/g)].map(match=>match[0]);
  if(stale.length)throw new Error(file+': local JavaScript still uses query-string cache busting: '+stale.slice(0,3).join(', '));
  const refs=[...text.matchAll(/(["'])\/([^"']+\.js)\1/g)].map(match=>match[2]);
  for(const ref of refs){
    if(ref==='sw.js')continue;
    if(!fs.existsSync(path.join(dist,ref)))throw new Error(file+': local JavaScript reference does not resolve: /'+ref);
  }
}
const pageBudgets={home:35*1024,tools:35*1024,calculator:40*1024,article:12*1024};
const totals={};
const articleRuntime=mapping['wa-article-runtime.js'];
if(!articleRuntime||gzipSync(fs.readFileSync(path.join(dist,articleRuntime))).length>=10*1024)throw new Error('Article runtime bundle must stay under 10 KB gzip');
for(const file of walk(dist).filter(file=>file.endsWith('.html'))){
  const html=fs.readFileSync(path.join(dist,file),'utf8');
  let type=null;
  if(file==='index.html')type='home';
  else if(file==='tools.html'||html.includes('class="tools-page"'))type='tools';
  else if(html.includes('data-wa-calculator='))type='calculator';
  else if(file.startsWith('articles/'))type='article';
  if(!type)continue;
  let bytes=0;
  for(const match of html.matchAll(/<script\s+[^>]*src=["']([^"']+)["'][^>]*>/gi)){
    const src=match[1];
    if(!src.startsWith('/'))continue;
    const relative=src.slice(1);
    if(relative==='sw.js')continue;
    const full=path.join(dist,relative);
    if(!fs.existsSync(full))throw new Error(file+': missing first-party script '+src);
    bytes+=gzipSync(fs.readFileSync(full)).length;
  }
  totals[type]=Math.max(totals[type]||0,bytes);
}
for(const [type,bytes] of Object.entries(totals)){
  console.log(type+' first-party JS gzip max: '+bytes+' bytes');
  if(bytes>pageBudgets[type])throw new Error(type+' page JS gzip budget exceeded: '+bytes+' > '+pageBudgets[type]);
}
console.log('JavaScript hash build PASS — '+jsFiles.length+' first-party scripts now use content-hashed filenames; service worker cache version updated.');
