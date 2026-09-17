import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=process.cwd();
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex').slice(0,12);
const siteVersion=hash('wa-site-runtime.js');
const calculatorVersion=hash('wa-calculator-runtime.js');
const htmlFiles=[];
const walk=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory()){if(!['.git','node_modules'].includes(entry.name))walk(full);}else if(/\.html$/i.test(entry.name))htmlFiles.push(full);}};
walk(root);
let changed=0;
for(const full of htmlFiles){let html=fs.readFileSync(full,'utf8');const before=html;
  html=html.replace(/\/wa-site-runtime\.js\?v=[^"']+/g,`/wa-site-runtime.js?v=${siteVersion}`);
  html=html.replace(/\/wa-calculator-runtime\.js\?v=[^"']+/g,`/wa-calculator-runtime.js?v=${calculatorVersion}`);
  if(html!==before){fs.writeFileSync(full,html,'utf8');changed++;}
}
console.log(`Runtime cache-busting complete — site=${siteVersion}, calculator=${calculatorVersion}, html files updated=${changed}.`);
