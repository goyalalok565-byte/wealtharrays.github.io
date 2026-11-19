import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const imagePath=path.join(root,'og-image.png');
if(!fs.existsSync(imagePath))throw new Error('Missing root og-image.png');
const png=fs.readFileSync(imagePath);
const signature=Buffer.from([137,80,78,71,13,10,26,10]);
if(png.length<24||!png.subarray(0,8).equals(signature))throw new Error('og-image.png is not a valid PNG');
const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
if(width!==1200||height!==630)throw new Error('og-image.png must be exactly 1200x630; found '+width+'x'+height);

function walk(dir){
  const out=[];
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(['.git','node_modules','dist','qa','scripts','docs','tests','calculator-definitions'].includes(entry.name))continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())out.push(...walk(full));
    else if(entry.isFile()&&entry.name.toLowerCase()==='index.html')out.push(full);
  }
  return out;
}
function meta(html,attribute,key){
  const escaped=key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const pattern=new RegExp('<meta[^>]+\\b'+attribute+'=["\\']'+escaped+'["\\'][^>]+content=["\\']([^"\\']+)["\\'][^>]*>|<meta[^>]+content=["\\']([^"\\']+)["\\'][^>]+\\b'+attribute+'=["\\']'+escaped+'["\\'][^>]*>','i');
  const match=html.match(pattern);
  return match?(match[1]||match[2]||''):'';
}
const pages=walk(root).filter(file=>{
  const html=fs.readFileSync(file,'utf8');
  return /data-wa-calculator/.test(html)&&/wa-calculator-runtime\\.js/.test(html);
});
if(pages.length!==55)throw new Error('Expected 55 calculator pages with canonical runtime; found '+pages.length);
const failures=[];
for(const file of pages){
  const html=fs.readFileSync(file,'utf8');
  const og=meta(html,'property','og:image');
  const type=meta(html,'property','og:image:type');
  const w=meta(html,'property','og:image:width');
  const h=meta(html,'property','og:image:height');
  const twitter=meta(html,'name','twitter:image');
  if(og!=='https://wealtharrays.com/og-image.png')failures.push(file+': og:image is '+og);
  if(type!=='image/png')failures.push(file+': og:image:type is '+type);
  if(w!=='1200'||h!=='630')failures.push(file+': OG dimensions are '+w+'x'+h);
  if(twitter!=='https://wealtharrays.com/og-image.png')failures.push(file+': twitter:image is '+twitter);
}
if(failures.length)throw new Error(failures.join('\\n'));
console.log('OG image audit PASS — 1200x630 PNG verified and referenced by all 55 calculator pages.');
