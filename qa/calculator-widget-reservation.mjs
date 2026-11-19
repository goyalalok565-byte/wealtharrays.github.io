import fs from 'node:fs';
import assert from 'node:assert/strict';
const registry=JSON.parse(fs.readFileSync('calculator-definitions/registry.json','utf8'));
const css=fs.readFileSync('phase4-premium.css','utf8');
assert.match(css,/#calc-widget\\.calc-widget\\{min-height:520px\\}/,'Calculator widget must reserve 520px before runtime mount');
for(const calculator of registry.calculators){
 const html=fs.readFileSync(calculator.slug+'/index.html','utf8');
 const host=html.match(/<div\\b[^>]*id=["']calc-widget["'][^>]*>/i)?.[0];
 assert.ok(host,calculator.id+': calculator host is missing');
 assert.match(host,/class=["'][^"']*\\bcalc-widget\\b[^"']*["']/i,calculator.id+': calc-widget class must exist before JS mounts');
}
console.log('CALCULATOR LAYOUT RESERVATION PASS: '+registry.count+' calculator hosts have calc-widget class and a 520px pre-mount reservation.');
