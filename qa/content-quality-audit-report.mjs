import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const registry=JSON.parse(fs.readFileSync('calculator-definitions/registry.json','utf8'));
const rows=[],paragraphs=new Map();
const strip=s=>s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
for(const c of registry.calculators){
 const file=path.join(c.slug,'index.html');assert.ok(fs.existsSync(file),'Missing '+file);
 const html=fs.readFileSync(file,'utf8'),article=html.match(/<article class="tool-article">([\s\S]*?)<\/article>/i)?.[1]||'';
 const words=strip(article).split(/\s+/).filter(Boolean).length,faqBlocks=[...article.matchAll(/<(?:div|details)\s+class=["']faq-item["'][^>]*>([\s\S]*?)<\/(?:div|details)>/gi)].map(match=>match[1]),faqQuestions=faqBlocks.map(block=>strip((block.match(/<(?:h3|summary)\b[^>]*>([\s\S]*?)<\/(?:h3|summary)>/i)||[])[1]||"")).filter(Boolean),faqs=new Set(faqQuestions).size;
 const sources=[...article.matchAll(/<a\b[^>]*href=["']https?:\/\//gi)].length;
 const example=/worked example|example inputs|example calculation|worked calculation/i.test(article);
 const updated=/last updated|updated on|reviewed on/i.test(article);
 const missing=[];if(words<1200)missing.push('1200+ words');if(faqs<5)missing.push('5+ FAQs');if(!example)missing.push('worked example');if(!sources)missing.push('source links');if(!updated)missing.push('last-updated date');
 rows.push({id:c.id,words,faqs,sources,example,updated,missing});
 for(const p of article.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)){const text=strip(p[1]);if(text.split(/\s+/).length<15)continue;if(!paragraphs.has(text))paragraphs.set(text,new Set());paragraphs.get(text).add(c.id);}
}
const duplicates=[...paragraphs.entries()].filter(([,ids])=>ids.size>1).map(([text,ids])=>({text,pages:[...ids].sort(),words:text.split(/\s+/).length})).sort((a,b)=>b.pages.length-a.pages.length||b.words-a.words);
assert.equal(duplicates.length,0,'Repeated boilerplate paragraphs must be rewritten before release.');
const count=k=>rows.filter(r=>k(r)).length;
const min=Math.min(...rows.map(r=>r.words)),sorted=rows.map(r=>r.words).sort((a,b)=>a-b),max=Math.max(...rows.map(r=>r.words)),median=sorted[Math.floor(sorted.length/2)];
const lines=['# Calculator content quality audit','', 'Registry calculators: '+rows.length+'. Article words min/median/max: '+min+'/'+median+'/'+max+'.','Passing pages — 1,200+ words: '+count(r=>r.words>=1200)+'; 5+ FAQs: '+count(r=>r.faqs>=5)+'; worked examples: '+count(r=>r.example)+'; source links: '+count(r=>r.sources>0)+'; last-updated dates: '+count(r=>r.updated)+'.','Exact shared paragraphs across multiple pages (15+ words): '+duplicates.length+'.','', '| Calculator | Words | FAQs | Sources | Worked example | Updated | Missing |','|---|---:|---:|---:|---|---|---|',...rows.map(r=>'| '+r.id+' | '+r.words+' | '+r.faqs+' | '+r.sources+' | '+(r.example?'Yes':'No')+' | '+(r.updated?'Yes':'No')+' | '+r.missing.join(', ')+' |'),'','## Repeated paragraphs','',...duplicates.map(d=>'- Shared by '+d.pages.length+' pages ('+d.pages.join(', ')+', '+d.words+' words): '+d.text),'','This is a measured audit, not a subjective score. It does not pad articles with generic filler. Pages remain incomplete until their missing requirements are researched and written with calculator-specific evidence.',''];
fs.mkdirSync('docs/audits',{recursive:true});fs.writeFileSync('docs/audits/content-quality-audit.md',lines.join('\n'));
console.log('CONTENT AUDIT: '+rows.length+' pages; 1,200+ words '+count(r=>r.words>=1200)+'; 5+ FAQs '+count(r=>r.faqs>=5)+'; sources '+count(r=>r.sources>0)+'; updated dates '+count(r=>r.updated)+'; exact duplicate paragraphs '+duplicates.length+'.');
