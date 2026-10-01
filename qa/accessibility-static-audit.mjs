import fs from 'node:fs';
import path from 'node:path';
const files=[]; function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){if(e.name.startsWith('.')||e.name==='node_modules'||e.name==='dist')continue;const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(e.name.endsWith('.html'))files.push(p)}} walk('.');
const errors=[];
for(const f of files){const h=fs.readFileSync(f,'utf8'),rel=f.replaceAll(path.sep,'/');
 if(/<img\\b(?![^>]*\\balt=)[^>]*>/i.test(h)) errors.push(rel+': image without alt');
 const buttons=[...h.matchAll(/<button\\b([^>]*)>([\\s\\S]*?)<\\/button>/gi)]; for(const b of buttons){const attrs=b[1],body=b[2].replace(/<[^>]+>/g,'').trim();if(!body&&!/aria-label=/i.test(attrs))errors.push(rel+': unnamed button');}
 const inputs=[...h.matchAll(/<(input|select|textarea)\\b([^>]*)>/gi)]; for(const m of inputs){const a=m[2];if(/aria-label=/i.test(a))continue;const id=a.match(/\\bid=["']([^"']+)["']/i)?.[1];if(id&&!new RegExp('<label[^>]+for=["']'+id.replace(/[.*+?^${}()|[\\]\\\\]/g,'\\\\$&')+'["']','i').test(h))errors.push(rel+': field '+id+' has no label or aria-label');}
}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('Accessibility static audit PASS:',files.length,'HTML pages checked.');