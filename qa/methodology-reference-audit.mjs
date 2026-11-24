import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
for (const directory of ['.', 'dist']) {
  const file = path.join(root, directory, 'methodology.html');
  const html = fs.readFileSync(file, 'utf8');
  const sourceOfTruthCount = html.split('Source of truth:</strong>').length - 1;
  if (sourceOfTruthCount !== 1) {
    throw new Error(directory + ': expected exactly one source-of-truth note, found ' + sourceOfTruthCount);
  }
  if (html.includes('widely-cited \\')) {
    throw new Error(directory + ': truncated retirement formula description remains');
  }
  if (!html.includes('not a validated safe-withdrawal recommendation') ||
      !html.includes('or a guarantee that a portfolio will last')) {
    throw new Error(directory + ': retirement heuristic limitation is missing');
  }
}
console.log('Methodology reference audit PASS: retirement heuristic is complete and source-of-truth note appears once in source and dist.');
