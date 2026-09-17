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
      const after = before.replaceAll('aria-label="Wealth Arrays home"', 'aria-label="Wealth Arrays"');
      if (after !== before) {
        fs.writeFileSync(full, after);
        changed += 1;
      }
    }
  }
}

walk(root);
console.log(`Accessible-name normalization: ${changed} HTML file(s) updated.`);
