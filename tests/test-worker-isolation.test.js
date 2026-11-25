import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

test('TEST Worker has a separate workers.dev identity and no production route', () => {
  const config = read('wrangler.test.toml');
  assert.match(config, /^name = "wealtharrays-api-test"$/m);
  assert.match(config, /^workers_dev = true$/m);
  assert.doesNotMatch(config, /^routes\s*=/m);
  assert.doesNotMatch(config, /wealtharrays\.com\/v1/);
  assert.match(config, /database_name = "wealtharrays-saas-test"/);
  assert.match(config, /database_id = "__TEST_D1_DATABASE_ID__"/);
  assert.match(config, /namespace_id = "2026112502"/);
});

test('TEST deployment reads only TEST-environment credentials and targets TEST resources', () => {
  const workflow = read('.github/workflows/cloudflare-test-deploy.yml');
  assert.match(workflow, /environment:\s*TEST/);
  assert.match(workflow, /secrets\.TEST_CLOUDFLARE_API_TOKEN/);
  assert.match(workflow, /secrets\.TEST_CLOUDFLARE_ACCOUNT_ID/);
  assert.match(workflow, /vars\.TEST_D1_DATABASE_ID/);
  assert.match(workflow, /secrets\.TEST_SUPABASE_URL/);
  assert.match(workflow, /secrets\.TEST_SUPABASE_ANON_KEY/);
  assert.match(workflow, /rzp_test_/);
  assert.match(workflow, /wealtharrays-api-test\.goyalalok565\.workers\.dev/);
  assert.doesNotMatch(workflow, /environment:\s*production/);
  assert.doesNotMatch(workflow, /wealtharrays-github-io/);
  assert.doesNotMatch(workflow, /https:\/\/wealtharrays\.com\/v1/);
});

test('legacy secrets sync workflow that wrote TEST keys to production is removed', () => {
  assert.equal(
    fs.existsSync(path.join(root, '.github/workflows/cloudflare-secrets-sync.yml')),
    false
  );
});

test('generated TEST Wrangler config is ignored by git', () => {
  assert.match(read('.gitignore'), /^\.wrangler\.test\.generated\.toml$/m);
});
