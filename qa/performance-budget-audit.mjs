import fs from 'node:fs';
import path from 'node:path';
const files=[]; function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){if(e.name.startsWith('.')||['node_modules','dist','qa','scripts'].includes(e.name))continue;const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(/\\.(js|css)$/.test(e.name))files.push(p)}} walk('.');
const budgets={js:300000,css:250000},failures=[];
for(const f of files){const ext=path.extname(f).slice(1),size=fs.statSync(f).size;if(size>(budgets[ext]||Infinity))failures.push(f+': '+size+' bytes > '+budgets[ext]);}
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('Performance budget audit PASS:',files.length,'JS/CSS assets checked.');