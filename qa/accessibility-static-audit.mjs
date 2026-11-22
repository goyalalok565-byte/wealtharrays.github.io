import fs from 'node:fs';
import path from 'node:path';

const files=[];
function walk(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(entry.name.startsWith('.')||entry.name==='node_modules'||entry.name==='dist')continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())walk(full);
    else if(entry.name.endsWith('.html'))files.push(full);
  }
}
walk('.');
const errors=[];
for(const file of files){
  const html=fs.readFileSync(file,'utf8');
  const rel=file.replaceAll(path.sep,'/');
  if(/<img\b(?![^>]*\balt=)[^>]*>/i.test(html))errors.push(rel+': image without alt');
  for(const match of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)){
    const attrs=match[1],body=match[2].replace(/<[^>]+>/g,'').trim();
    if(!body&&!/aria-label=/i.test(attrs))errors.push(rel+': unnamed button');
  }
  for(const match of html.matchAll(/<(input|select|textarea)\b([^>]*)>/gi)){
    const attrs=match[2];
    if(/aria-label=/i.test(attrs))continue;
    const id=attrs.match(/\bid=["']([^"']+)["']/i)?.[1];
    if(id){
      const hasFor=new RegExp('for=["\\\']'+id+'["\\\']','i').test(html);
      const before=html.slice(0,html.indexOf(match[0]));
      const wrapped=before.lastIndexOf('<label')>before.lastIndexOf('</label>');
      if(!hasFor&&!wrapped)errors.push(rel+': field '+id+' has no label or aria-label');
    }
  }
  const footerLogo=html.match(/<a\b[^>]*class=["'][^"']*\bfooter-logo\b[^"']*["'][^>]*>[\s\S]*?<\/a>/i);
  if(footerLogo){
    if(/\baria-label=/i.test(footerLogo[0]))errors.push(rel+': footer logo must derive its accessible name from visible text');
    if(!/<img\b[^>]*\balt=(["'])\1[^>]*>/i.test(footerLogo[0]))errors.push(rel+': footer logo image must be decorative when visible brand text is present');
    if(!/<b>\s*Wealth Arrays\s*<\/b>/i.test(footerLogo[0]))errors.push(rel+': footer logo visible brand text is missing');
  }
}
const homepageCss=fs.readFileSync('homepage-refresh.css','utf8');
const contrastRules=[
  '.wa-emi-result{color:var(--text)!important}',
  '.wa-emi-result>span{color:var(--text)!important;opacity:1!important}',
  '.wa-emi-result output{color:var(--text)!important}',
  '.wa-emi-result-meta span{color:var(--text)!important;opacity:1!important}',
  '.wa-emi-result-meta strong{color:var(--text)!important;opacity:1!important}'
];
for(const rule of contrastRules)if(!homepageCss.includes(rule))errors.push('homepage-refresh.css: quick EMI contrast rule missing: '+rule);
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('Accessibility static audit PASS:',files.length,'HTML pages checked; footer brand names and quick EMI contrast verified.');
