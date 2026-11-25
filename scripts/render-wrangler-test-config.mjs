import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const templatePath = path.join(root, 'wrangler.test.toml');
const outputPath = path.join(root, '.wrangler.test.generated.toml');
const databaseId = String(process.env.TEST_D1_DATABASE_ID || '').trim();
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

if (!uuidPattern.test(databaseId)) {
  throw new Error('TEST_D1_DATABASE_ID must be a valid D1 UUID supplied by the TEST environment.');
}

const template = fs.readFileSync(templatePath, 'utf8');
const placeholder = '__TEST_D1_DATABASE_ID__';
if (template.split(placeholder).length !== 2) {
  throw new Error('TEST Wrangler template must contain exactly one D1 database ID placeholder.');
}
const rendered = template.replace(placeholder, databaseId);
if (rendered.includes(placeholder) || !rendered.includes('database_name = "wealtharrays-saas-test"')) {
  throw new Error('Rendered Wrangler config did not pass TEST isolation checks.');
}

fs.writeFileSync(outputPath, rendered, { encoding: 'utf8', mode: 0o600 });
console.log('Generated isolated TEST Wrangler configuration.');
