import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let changed = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'qa') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith('.html')) {
      const before = fs.readFileSync(full, 'utf8');
      let after = before.replaceAll('aria-label="Wealth Arrays home"', 'aria-label="Wealth Arrays"').replaceAll('<select id="currency-select">','<select id="currency-select" aria-label="Currency">');
      if(entry.name==='widget.html'){
        after=after.replace(/\s*<script[^>]+src=["']\/calculators\.js[^>]*><\/script>/gi,'').replace(/\s*<script[^>]+src=["']\/wa-calculator-runtime\.js[^>]*><\/script>/gi,'').replace(/\s*<script[^>]+src=["']\/widget-bootstrap\.js[^>]*><\/script>/gi,'');
        after=after.replace('</body>','<script src="/calculators.js"></script><script src="/wa-calculator-runtime.js"></script><script src="/widget-bootstrap.js"></script></body>');
      }
      if (after !== before) {
        fs.writeFileSync(full, after);
        changed += 1;
      }
    }
  }
}

walk(root);
console.log(`Accessible-name normalization: ${changed} HTML file(s) updated.`);
