import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const canonicalSources = ['widget.js','wa-core.js','site-runtime.js','final-polish.js','theme-fix.js','phase3-seo.js','calculator-page-init.js','phase4-premium.js'];
const siteSources = ['wa-core.js','site-runtime.js','final-polish.js','theme-fix.js','phase3-seo.js','phase4-premium.js'];
const supportSources = ['theme-init.js','404-runtime.js'];
const sourceFiles = [...canonicalSources,...supportSources];
for(const file of sourceFiles) if(!fs.existsSync(path.join(root,file))) throw new Error(`Missing source: ${file}`);
const js=sourceFiles.map(file=>({file,text:fs.readFileSync(path.join(root,file),'utf8')}));
const normalize=text=>text.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'').replace(/\s+/g,' ').trim();
const hashes=new Map();
for(const {file,text} of js){const hash=crypto.createHash('sha256').update(normalize(text)).digest('hex');if(hashes.has(hash)) throw new Error(`Duplicate source module content: ${file} duplicates ${hashes.get(hash)}`);hashes.set(hash,file);}

const calculatorBundle=fs.readFileSync('wa-calculator-runtime.js','utf8');
for(const {file,text} of js.slice(0,canonicalSources.length)){const hash=crypto.createHash('sha256').update(text.replace(/\r\n/g,'\n').trimEnd()).digest('hex').slice(0,12);if(!calculatorBundle.includes(`WA CANONICAL MODULE | calculator | ${file} | sha256:${hash}`)) throw new Error(`Calculator bundle provenance missing/stale for ${file}`);}
const siteBundle=fs.readFileSync('wa-site-runtime.js','utf8');
for(const file of siteSources){const text=fs.readFileSync(path.join(root,file),'utf8');const hash=crypto.createHash('sha256').update(text.replace(/\r\n/g,'\n').trimEnd()).digest('hex').slice(0,12);if(!siteBundle.includes(`WA CANONICAL MODULE | site | ${file} | sha256:${hash}`)) throw new Error(`Site bundle provenance missing/stale for ${file}`);}
const pages=fs.readdirSync(root).filter(f=>f.endsWith('.html')).filter(f=>fs.readFileSync(f,'utf8').includes('wa-calculator-runtime.js'));
if(pages.length!==20) throw new Error(`Expected 20 calculator runtime pages, found ${pages.length}`);
for(const page of pages){const id=fs.readFileSync(page,'utf8').match(/data-wa-calculator="([^"]+)"/i)?.[1];if(!id||!fs.existsSync(path.join(root,'calculator-definitions',`${id}.js`))) throw new Error(`${page}: missing split calculator definition for ${id||'unknown'}`);}
for(const page of pages){const html=fs.readFileSync(page,'utf8');const srcs=[...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)].map(m=>m[1]);const loadedBasenames=new Set(srcs.map(src=>src.split('?')[0].split('#')[0].split('/').pop()));for(const file of canonicalSources) if(loadedBasenames.has(file)) throw new Error(`${page}: direct calculator runtime dependency ${file}`);}

if(fs.existsSync('calculator-runtime.js')) throw new Error('Retired calculator-runtime.js must not exist');
if(fs.statSync('wa-calculator-runtime.js').size>750_000) throw new Error(`Canonical calculator runtime exceeds 750 KB`);
if(fs.statSync('wa-site-runtime.js').size>750_000) throw new Error(`Canonical site runtime exceeds 750 KB`);
if(fs.existsSync('node_modules')) throw new Error('node_modules must not exist in deployable tree');
console.log(`Code-quality audit PASS — ${canonicalSources.length} canonical calculator source modules plus ${supportSources.length} support modules are unique; calculator/site provenance is fresh; calculator-only Phase 2 code is isolated; calculator pages are isolated from direct source dependencies; deploy-tree hygiene is clean.`);
