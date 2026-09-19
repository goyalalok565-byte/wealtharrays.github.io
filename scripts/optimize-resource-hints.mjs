import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const htmlFiles=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(entry.name.startsWith('.')||entry.name==='node_modules')continue;const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else if(entry.name.endsWith('.html'))htmlFiles.push(full);}}
walk(root);
let changed=0;
for(const file of htmlFiles){let html=fs.readFileSync(file,'utf8');const before=html;
  if(/<link[^>]+rel=["']stylesheet["'][^>]+href=["'][^"']*styles\.css/i.test(html)&&!html.includes('rel="preload" as="style" href="/styles.css"')){
    html=html.replace(/(<link[^>]+rel=["']stylesheet["'][^>]+href=["'][^"']*styles\.css[^>]*>)/i,'<link rel="preload" as="style" href="/styles.css">$1');
  }
  // Skip AdSense preconnect hints on pages that must never carry AdSense.
  const base=path.basename(file);
  const adsenseExcluded=['404.html','widget.html','privacy-policy.html'].includes(base);
  if(adsenseExcluded){
    html=html.replace(/<link rel="preconnect" href="https:\/\/pagead2\.googlesyndication\.com" crossorigin>/g,'');
    html=html.replace(/<link rel="preconnect" href="https:\/\/googleads\.g\.doubleclick\.net" crossorigin>/g,'');
  } else if(!html.includes('rel="preconnect" href="https://pagead2.googlesyndication.com"')){
    const hints='<link rel="preconnect" href="https://pagead2.googlesyndication.com" crossorigin><link rel="preconnect" href="https://googleads.g.doubleclick.net" crossorigin>';
    html=html.replace(/<link[^>]+rel=["']stylesheet["'][^>]+href=["'][^"']*styles\.css[^>]*>/i,m=>`${hints}${m}`);
  }
  if(html!==before){fs.writeFileSync(file,html,'utf8');changed++;}
}
console.log(`Resource hints optimized: ${changed} HTML file(s).`);
