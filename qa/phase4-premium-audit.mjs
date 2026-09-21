import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const calc = [
  'sip-calculator.html','compound-interest-calculator.html','mortgage-emi-calculator.html','roi-calculator.html',
  'simple-interest-calculator.html','retirement-calculator.html','salary-to-hourly-calculator.html','profit-margin-calculator.html',
  'fixed-deposit-calculator.html','recurring-deposit-calculator.html','lumpsum-calculator.html','cagr-calculator.html',
  'car-loan-calculator.html','personal-loan-calculator.html','debt-payoff-calculator.html','inflation-calculator.html',
  'net-worth-calculator.html','overtime-pay-calculator.html','freelance-rate-calculator.html','income-tax-scenario-calculator.html'
];
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const walk=(dir, out=[])=>{for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.name.startsWith('.')||e.name==='node_modules')continue;const full=path.join(dir,e.name);if(e.isDirectory())walk(full,out);else if(e.name.endsWith('.html'))out.push(full)}return out};
const publicFiles=walk(root).filter(f=>{const r=path.relative(root,f).replaceAll(path.sep,'/');return !r.startsWith('p/')&&!r.startsWith('qa/')&&!r.startsWith('scripts/')&&!r.startsWith('tests/')});
if(!fs.existsSync(path.join(root,'wa-site-runtime.js'))) failures.push('wa-site-runtime.js missing');
if(!fs.existsSync(path.join(root,'wa-calculator-runtime.js'))) failures.push('wa-calculator-runtime.js missing');
if(!fs.existsSync(path.join(root,'phase4-premium.css'))) failures.push('phase4-premium.css missing');
if(!fs.existsSync(path.join(root,'theme-init.js'))) failures.push('theme-init.js missing');
if(!fs.existsSync(path.join(root,'404-runtime.js'))) failures.push('404-runtime.js missing');
for(const f of calc){if(!fs.existsSync(path.join(root,f))) failures.push(`Missing calculator: ${f}`);}
for(const full of publicFiles){
 const r=path.relative(root,full).replaceAll(path.sep,'/'), s=fs.readFileSync(full,'utf8');
 if(!s.includes('/phase4-premium.css')) failures.push(`${r}: missing Phase 4 CSS`);
 if(r!=='offline.html' && r!=='widget.html' && !s.includes('/theme-init.js')) failures.push(`${r}: missing external theme bootstrap`);
 if(!s.includes('name="referrer" content="strict-origin-when-cross-origin"')) failures.push(`${r}: missing referrer policy meta`);
 if(/<script[^>]+src=["']\/?(?:phase4-premium|calculator-page-init|site-runtime|wa-core|final-polish|theme-fix|phase2-intelligence|phase2-retirement|phase3-seo)\.js(?:[?#][^"']*)?["']/i.test(s)) failures.push(`${r}: legacy runtime source loaded directly; use canonical bundle`);
}
for(const f of calc){const s=read(f);if(!/<h1\b/i.test(s)) failures.push(`${f}: missing H1`);if(!s.includes('/wa-calculator-runtime.js')) failures.push(`${f}: missing canonical calculator runtime`);}
for(const name of ['404.html','widget.html']){
  const s=read(name);
  if(s.includes('adsbygoogle.js')||s.includes('ca-pub-6507600103785450')) failures.push(name+': AdSense must not be present');
  if(s.includes('pagead2.googlesyndication.com')||s.includes('googleads.g.doubleclick.net')) failures.push(name+': AdSense preconnect must not be present');
  if(name==='widget.html'){
    if(!s.includes('/calculators.js')) failures.push(name+': calculators.js bootstrap missing');
    if(!s.includes('/wa-calculator-runtime.js')) failures.push(name+': calculator runtime bootstrap missing');
    if(/<html\s+data-wa-calculator=/i.test(s)) failures.push(name+': widget must not be converted into calculator-page bootstrap mode');
  }
}
for(const full of publicFiles){
  const r=path.relative(root,full).replaceAll(path.sep,'/'), s=fs.readFileSync(full,'utf8');
  const apple=(s.match(/<link\s+[^>]*rel=["']apple-touch-icon["'][^>]*>/gi)||[]).length;
  if(apple>1) failures.push(r+': duplicate apple-touch-icon tags ('+apple+')');
}
const widgetSource=fs.readFileSync('widget.js','utf8');
if(!widgetSource.includes('new URL(`/widget.html?calc=${encodeURIComponent(calc.id)}`,location.origin).href')) failures.push('widget.js: embed URL must use the root /widget route');
const headers=fs.existsSync('_headers')?fs.readFileSync('_headers','utf8'):'';
for(const rule of ['/widget','/widget.html']){
  const marker=rule+'\n';
  const start=headers.lastIndexOf(marker);
  const next=start>=0?headers.indexOf('\n/',start+marker.length):-1;
  const block=start>=0?headers.slice(start,next>=0?next:headers.length):'';
  if(!block.includes('! X-Frame-Options')) failures.push(rule+': X-Frame-Options must be detached for embeds');
  if(!block.includes('! Cross-Origin-Resource-Policy')) failures.push(rule+': Cross-Origin-Resource-Policy must be detached for embeds');
  if(!block.includes('frame-ancestors *')) failures.push(rule+': CSP must allow external iframe embedding');
}

if(!headers.includes('Strict-Transport-Security')) failures.push('_headers: HSTS missing');
if(!headers.includes('X-Content-Type-Options: nosniff')) failures.push('_headers: nosniff missing');
if(!headers.includes('Referrer-Policy: strict-origin-when-cross-origin')) failures.push('_headers: referrer policy missing');
if(!headers.includes('frame-ancestors')) failures.push('_headers: frame-ancestors missing');
if(!headers.includes("script-src 'self' https://www.googletagmanager.com")) failures.push('_headers: CSP script source policy not hardened');
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log(`Phase 4 premium audit PASS — ${publicFiles.length} HTML files and ${calc.length} canonical calculators checked.`);
