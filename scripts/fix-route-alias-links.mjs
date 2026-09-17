import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const htmlFiles=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(entry.name.startsWith('.')||entry.name==='node_modules')continue;const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else if(entry.name.endsWith('.html'))htmlFiles.push(full);}}
walk(root);
let changed=0;
for(const file of htmlFiles){let html=fs.readFileSync(file,'utf8');if(!/<meta[^>]+http-equiv=["']refresh["']/i.test(html))continue;const canonical=html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1];if(!canonical)continue;let pathname;try{pathname=new URL(canonical).pathname}catch{continue;}const before=html;html=html.replace(/(<a\b[^>]*\bhref=["'])[^"']+(["'][^>]*>\s*(?:Continue|Redirecting|Open|Go)[^<]*<\/a>)/i,`$1${pathname}$2`);if(html!==before){fs.writeFileSync(file,html,'utf8');changed++;}}
console.log(`Route alias links normalized: ${changed} file(s).`);
