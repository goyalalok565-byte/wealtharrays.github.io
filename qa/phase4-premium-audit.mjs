import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const files=[];
function walk(dir){for(const n of fs.readdirSync(dir)){if(n.startsWith('.')||n==='node_modules')continue;const f=path.join(dir,n),s=fs.statSync(f);if(s.isDirectory())walk(f);else if(n.endsWith('.html'))files.push(f)}}
walk(root);
const publicFiles=files.filter(f=>!f.split(path.sep).includes('p')&&!f.split(path.sep).slice(0,-1).some(x=>x==='node_modules'));
const calc=['sip-calculator.html','compound-interest-calculator.html','mortgage-emi-calculator.html','roi-calculator.html','simple-interest-calculator.html','retirement-calculator.html','salary-to-hourly-calculator.html','profit-margin-calculator.html','fixed-deposit-calculator.html','recurring-deposit-calculator.html','lumpsum-calculator.html','cagr-calculator.html','car-loan-calculator.html','personal-loan-calculator.html','debt-payoff-calculator.html','inflation-calculator.html','net-worth-calculator.html','overtime-pay-calculator.html','freelance-rate-calculator.html','income-tax-scenario-calculator.html'];
const failures=[];
if(!fs.existsSync('phase4-premium.js')||!fs.existsSync('phase4-premium.css')||!fs.existsSync('theme-init.js')||!fs.existsSync('calculator-page-init.js')||!fs.existsSync('404-runtime.js')) failures.push('Phase 4 runtime assets missing');
for(const f of calc){if(!fs.existsSync(f)) failures.push(`Missing calculator: ${f}`);}
for(const f of publicFiles){const s=fs.readFileSync(f,'utf8');
 if(!s.includes('/phase4-premium.css')) failures.push(`${f}: missing Phase 4 CSS`);
 if(!s.includes('/phase4-premium.js')) failures.push(`${f}: missing Phase 4 JS`);
 if(!s.includes('/theme-init.js')) failures.push(`${f}: missing external theme bootstrap`);
 if(/<script>document\.documentElement\.dataset\.theme=/.test(s)) failures.push(`${f}: inline theme bootstrap remains`);
 if(/<script>\(function\(\)\{var p=location\.pathname/.test(s)) failures.push(`${f}: inline 404 redirect remains`);
 if(/<script>[^<]*mountCalculator\(CALCULATORS/.test(s)) failures.push(`${f}: inline calculator bootstrap remains`);
 if(!/<meta name="referrer" content="strict-origin-when-cross-origin">/.test(s)) failures.push(`${f}: missing referrer policy meta`);
}
for(const f of calc){const s=fs.readFileSync(f,'utf8');if(!/<h1\b/i.test(s)) failures.push(`${f}: missing H1`);if(!s.includes('/calculator-page-init.js')) failures.push(`${f}: missing external calculator bootstrap`);}
const headers=fs.existsSync('_headers')?fs.readFileSync('_headers','utf8'):'';
if(!headers.includes('Strict-Transport-Security')) failures.push('_headers: HSTS missing');
if(!headers.includes('X-Content-Type-Options: nosniff')) failures.push('_headers: nosniff missing');
if(!headers.includes('Referrer-Policy: strict-origin-when-cross-origin')) failures.push('_headers: referrer policy missing');
if(!headers.includes('frame-ancestors')) failures.push('_headers: frame-ancestors missing');
if(!headers.includes("script-src 'self' https://www.googletagmanager.com")) failures.push('_headers: CSP script source policy not hardened');
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log(`Phase 4 premium audit PASS — ${publicFiles.length} public HTML files and ${calc.length} canonical calculators checked.`);
