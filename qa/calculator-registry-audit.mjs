import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { CALCULATORS } = require('../calculators.js');
const root = process.cwd();
const fail = message => { throw new Error('Calculator registry audit failed: ' + message); };
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
if (!Array.isArray(CALCULATORS) || !CALCULATORS.length) fail('calculators.js must export a non-empty CALCULATORS array');
const ids = CALCULATORS.map(calc => calc.id);
const slugs = CALCULATORS.map(calc => calc.slug);
if (ids.some(id => !id) || new Set(ids).size !== ids.length) fail('calculator IDs must be present and unique');
if (slugs.some(slug => !slug) || new Set(slugs).size !== slugs.length) fail('calculator slugs must be present and unique');

const homepage = read('index.html');
const tools = read('tools.html');
const search = read('calculator-search.js');
const llms = read('llms.txt');
const sitemap = read('sitemap.xml');
const methodology = read('methodology.html');
const build = read('scripts/root-cause-build.mjs');
const pageIds = new Set();
for (const calc of CALCULATORS) {
  const route = '/' + calc.slug + '/';
  const pagePath = path.join(calc.slug, 'index.html');
  const definitionPath = path.join('calculator-definitions', calc.id + '.js');
  if (!fs.existsSync(path.join(root, pagePath))) fail('missing generated page: ' + pagePath);
  if (!fs.existsSync(path.join(root, definitionPath))) fail('missing split definition: ' + definitionPath);
  const page = read(pagePath);
  const id = page.split('data-wa-calculator="')[1]?.split('"')[0];
  if (id !== calc.id) fail(pagePath + ' maps to ' + id + ', expected ' + calc.id);
  pageIds.add(id);
  if (!homepage.includes('href="' + route + '"')) fail('homepage missing route ' + route);
  if (!tools.includes('href="' + route + '"')) fail('tools library missing route ' + route);
  if (!search.includes('"' + route + '"')) fail('calculator search missing route ' + route);
  if (!llms.includes('https://wealtharrays.com' + route)) fail('llms.txt missing route ' + route);
  if (!sitemap.includes('<loc>https://wealtharrays.com' + route + '</loc>')) fail('sitemap missing route ' + route);
  if (!methodology.includes('href="' + route + '"')) fail('methodology missing route ' + route);
  if (!/<title[^>]*>[^<]+<\/title>/i.test(page)) fail(pagePath + ' missing title metadata');
  if (!/<meta[^>]+name=["']description["'][^>]+content=["'][^"']+["']/i.test(page)) fail(pagePath + ' missing description metadata');
  if (!page.includes('rel="canonical"') || !page.includes('https://wealtharrays.com' + route)) fail(pagePath + ' missing canonical URL');
}
if (pageIds.size !== CALCULATORS.length) fail('generated route IDs do not match registry size');
if (!build.includes('CALCULATORS')) fail('page/sitemap generator must consume the canonical registry');

const workflowDir = path.join(root, '.github', 'workflows');
for (const name of fs.readdirSync(workflowDir).filter(name => name.endsWith('.yml') || name.endsWith('.yaml'))) {
  const source = fs.readFileSync(path.join(workflowDir, name), 'utf8');
  if (/\b47\s+calculators?\b/i.test(source) || /all-47-calculators/i.test(source)) fail(name + ' contains stale 47-calculator coverage');
  if (/\ball\s+55\s+calculators?\b/i.test(source)) fail(name + ' hardcodes the calculator catalogue count');
}
console.log('Calculator registry audit PASS — ' + CALCULATORS.length + ' canonical IDs are represented in pages, split definitions, homepage, tools, search, llms.txt, sitemap, methodology and metadata; workflows do not hardcode the catalogue count.');
