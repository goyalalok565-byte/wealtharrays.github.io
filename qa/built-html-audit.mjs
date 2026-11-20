import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {CALCULATORS}=require('../calculators.js');
const root=process.env.SITE_ROOT||'dist';
const output=process.env.OUTPUT_CSV||'/tmp/wa-built-html-audit.csv';
if(CALCULATORS.length!==55)throw new Error('Expected 55 canonical calculator definitions, found '+CALCULATORS.length+'.');
const decode=value=>String(value||'').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>');
const textContent=value=>decode(String(value||'').replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim());
const attr=(tag,name)=>{
  const pattern="(?:^|\\s)"+name+"\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))";
  const match=tag.match(new RegExp(pattern,'i'));
  return match?(match[1]??match[2]??match[3]??''):'';
};
const csv=value=>'"'+String(value??'').replace(/"/g,'""').replace(/\r?\n/g,' ')+'"';
const countWords=value=>(textContent(value).match(/[\p{L}\p{N}][\p{L}\p{N}'’.-]*/gu)||[]).length;
const pages=CALCULATORS.map(calc=>({id:calc.id,slug:calc.slug,file:path.join(root,calc.slug,'index.html')}));
const collected=[];
for(const page of pages){
  if(!fs.existsSync(page.file))throw new Error('Built calculator HTML missing: '+page.file);
  const html=fs.readFileSync(page.file,'utf8');
  const title=textContent(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'');
  const descriptionTag=(html.match(/<meta\b[^>]*>/gi)||[]).find(tag=>attr(tag,'name').toLowerCase()==='description');
  const h1=textContent(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||'');
  const canonicalTag=(html.match(/<link\b[^>]*>/gi)||[]).find(tag=>attr(tag,'rel').toLowerCase().split(/\s+/).includes('canonical'));
  const articleMatch=html.match(/<article\b(?=[^>]*class=["'][^"']*\btool-article\b[^"']*["'])[^>]*>([\s\S]*?)<\/article>/i);
  const mainMatch=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  const contentHtml=articleMatch?.[1]||mainMatch?.[1]||html;
  const contentText=textContent(contentHtml);
  const jsonScripts=[...html.matchAll(/<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi)];
  let faqCount=0,questionCount=0;
  const visit=value=>{
    if(Array.isArray(value)){value.forEach(visit);return;}
    if(!value||typeof value!=='object')return;
    const types=Array.isArray(value['@type'])?value['@type']:[value['@type']];
    if(types.includes('Question'))questionCount++;
    if(types.includes('FAQPage')&&Array.isArray(value.mainEntity))faqCount+=value.mainEntity.length;
    Object.entries(value).forEach(([key,item])=>{if(key!=='mainEntity'||!types.includes('FAQPage'))visit(item);});
  };
  for(const script of jsonScripts){try{visit(JSON.parse(script[1]));}catch(_error){}}
  const schemaFaqCount=faqCount;
  const htmlFaqCount=(contentHtml.match(/<(?:details|div|section)\b(?=[^>]*\bclass=["'][^"']*\bfaq-item\b)[^>]*>/gi)||[]).length;
  const visibleFaqCount=Math.max(schemaFaqCount,questionCount,htmlFaqCount);
  const sourceLinks=new Set();
  for(const match of contentHtml.matchAll(/<a\b[^>]*>/gi)){
    const href=attr(match[0],'href');
    if(!/^https?:\/\//i.test(href))continue;
    try{const url=new URL(href);if(!/(^|\.)wealtharrays\.com$/i.test(url.hostname))sourceLinks.add(url.href);}catch(_error){}
  }
  const paragraphs=[...contentHtml.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map(match=>textContent(match[1]).toLowerCase()).filter(value=>value.length>=40);
  collected.push({
    id:page.id,slug:page.slug,title,metaDescription:attr(descriptionTag||'','content'),
    h1,canonical:attr(canonicalTag||'','href'),jsonLdCount:jsonScripts.length,
    faqCount:visibleFaqCount,schemaFaqCount,htmlFaqCount,
    words:countWords(contentHtml),
    workedExample:/worked example|worked calculation|example calculation|example inputs|example scenario/i.test(contentText)?'yes':'no',
    sourceLinks:sourceLinks.size,paragraphs
  });
}
const frequency=new Map();
for(const page of collected)for(const paragraph of new Set(page.paragraphs))frequency.set(paragraph,(frequency.get(paragraph)||0)+1);
const headers=['calculator_id','slug','title','meta_description','h1','canonical','json_ld_count','faq_count','schema_faq_count','html_faq_count','words','worked_example','source_links','repeated_paragraph_count','repeated_paragraph_examples'];
const rows=[headers];
for(const page of collected){
  const repeated=[...new Set(page.paragraphs)].filter(paragraph=>(frequency.get(paragraph)||0)>1);
  rows.push([page.id,page.slug,page.title,page.metaDescription,page.h1,page.canonical,page.jsonLdCount,page.faqCount,page.schemaFaqCount,page.htmlFaqCount,page.words,page.workedExample,page.sourceLinks,repeated.length,repeated.slice(0,3).join(' | ')]);
}
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,rows.map(row=>row.map(csv).join(',')).join('\n')+'\n','utf8');
console.log('Built HTML audit CSV written: '+output+' ('+collected.length+'/55 canonical calculator pages).');
