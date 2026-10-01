import fs from 'node:fs';
import path from 'node:path';
const files=[];
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){if(e.name.startsWith('.')||e.name==='node_modules'||e.name==='dist')continue;const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(e.name.endsWith('.html'))files.push(p)}}
walk('.');
const errors=[];
for(const f of files){
  const h=fs.readFileSync(f,'utf8'),rel=f.replaceAll(path.sep,'/');
  if(/<img\b(?![^>]*\balt=)[^>]*>/i.test(h)) errors.push(rel+': image without alt');
  for(const m of h.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)){const attrs=m[1],body=m[2].replace(/<[^>]+>/g,'').trim();if(!body&&!/aria-label=/i.test(attrs))errors.push(rel+': unnamed button');}
  for(const m of h.matchAll(/<(input|select|textarea)\b([^>]*)>/gi)){const attrs=m[2];if(/aria-label=/i.test(attrs))continue;const id=attrs.match(/\bid=["']([^"']+)["']/i)?.[1];if(id){const safe=id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');if(!new RegExp('<label[^>]+for=["']'+safe+'["']','i').test(h))errors.push(rel+': field '+id+' has no label or aria-label');}}
}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('Accessibility static audit PASS:',files.length,'HTML pages checked.');