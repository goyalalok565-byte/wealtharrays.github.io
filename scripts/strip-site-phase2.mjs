import fs from 'node:fs';

const file = 'wa-site-runtime.js';
const htmlSafeMarker = /\/\* ===== WA CANONICAL MODULE \| site \| (phase2-intelligence\.js|phase2-retirement\.js) \| sha256:[0-9a-f]+ ===== \*\/[\s\S]*?(?=\/\* ===== WA CANONICAL MODULE \| site \| |$)/g;
const source = fs.readFileSync(file, 'utf8');
const output = source.replace(htmlSafeMarker, '');
if (output === source) throw new Error('No Phase 2 site modules were found to strip; build architecture may have changed.');
fs.writeFileSync(file, output, 'utf8');
console.log('Site runtime code-split: calculator-only Phase 2 intelligence modules removed from wa-site-runtime.js.');
