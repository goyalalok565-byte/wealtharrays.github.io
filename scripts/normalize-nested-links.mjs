import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const rootFiles=new Set();
for(const entry of fs.readdirSync(root,{withFileTypes:true})) if(entry.isFile()&&entry.name.endsWith('.html')) rootFiles.add('/'+entry.name.replace(/\.html$/i,''));
const rootDirs=new Set();
for(const entry of fs.readdirSync(root,{withFileTypes:true})) if(entry.isDirectory()&&!entry.name.startsWith('.')&&!['node_modules','qa','scripts'].includes(entry.name)&&fs.existsSync(path.join(root,entry.name,'index.html'))) rootDirs.add('/'+entry.name+'/');
const htmlFiles=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(entry.name.startsWith('.')||entry.name==='node_modules')continue;const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else if(entry.name.endsWith('.html'))htmlFiles.push(full);}}
walk(root);
const isExternal=h=>/^(?:https?:|mailto:|tel:|javascript:|data:|#)/i.test(h);
const isAsset=h=>/\.(?:css|js|mjs|json|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|xml|txt|webmanifest)(?:[?#].*)?$/i.test(h);
const rootCandidate=h=>{const clean=h.split('#')[0].split('?')[0];if(!clean||isExternal(clean)||isAsset(clean)||clean.startsWith('/'))return null;const noSlash=clean.replace(/^\.\.\//,'').replace(/^\.\//,'');const route=noSlash.endsWith('/')?'/'+noSlash:'/'.concat(noSlash);if(rootDirs.has(route))return route;if(rootFiles.has(route.replace(/\/$/,'')))return route.replace(/\/$/,'');return null;};
let changed=0;
for(const file of htmlFiles){const before=fs.readFileSync(file,'utf8');let html=before;html=html.replace(/(\bhref=["'])([^"']+)(["'])/gi,(all,pre,href,post)=>{const candidate=rootCandidate(href);return candidate?pre+candidate+post:all;});if(html!==before){fs.writeFileSync(file,html,'utf8');changed++;}}
console.log(`Nested canonical links normalized: ${changed} HTML file(s).`);
