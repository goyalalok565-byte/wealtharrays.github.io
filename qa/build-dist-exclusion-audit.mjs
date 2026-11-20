import fs from 'node:fs';
import path from 'node:path';
import { isForbiddenDeploymentPath } from '../scripts/deployment-path-policy.mjs';

const root = process.cwd();
const dist = path.join(root, 'dist');
const manifestPath = path.join(dist, '.well-known', 'wa-public-manifest.json');
const fail = message => { throw new Error('Dist exclusion audit failed: ' + message); };
if (!fs.existsSync(manifestPath)) fail('public deployment manifest is missing');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (manifest.schema_version !== 1) fail('unsupported manifest schema');
const actual = [];
function walk(dir, rel = '') {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const current = path.join(rel, entry.name).replaceAll(path.sep, '/');
    if (entry.isDirectory()) walk(path.join(dir, entry.name), current);
    else actual.push(current);
  }
}
walk(dist);
const actualSorted = actual.sort();
const declared = [...(manifest.deployment_files || [])].sort();
if (JSON.stringify(actualSorted) !== JSON.stringify(declared)) fail('manifest does not match the exact dist file inventory');
const publicFiles = manifest.public_files || [];
if (!publicFiles.includes('.well-known/wa-public-manifest.json')) fail('manifest must include itself in the public inventory');
for (const file of actualSorted) if (isForbiddenDeploymentPath(file)) fail('forbidden path emitted: ' + file);
for (const file of publicFiles) if (!actualSorted.includes(file)) fail('public inventory references a missing file: ' + file);
for (const config of ['_headers', '_redirects']) {
  if (!manifest.deployment_config_files?.includes(config)) fail('Cloudflare deployment config missing from manifest: ' + config);
}
console.log('Dist exclusion audit PASS — ' + publicFiles.length + ' public files and ' + manifest.deployment_config_files.length + ' Cloudflare config files match the exact dist inventory; no internal QA/docs/tests/backups/archive paths are present.');
