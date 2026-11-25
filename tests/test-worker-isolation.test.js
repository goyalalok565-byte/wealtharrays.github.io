import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

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

test('TEST config renderer substitutes only a valid TEST D1 UUID', () => {
  const outputPath = path.join(root, '.wrangler.test.generated.toml');
  const validId = '123e4567-e89b-42d3-a456-426614174000';
  try {
    const good = spawnSync(process.execPath, [path.join(root, 'scripts/render-wrangler-test-config.mjs')], {
      cwd: root,
      encoding: 'utf8',
      env: { ...process.env, TEST_D1_DATABASE_ID: validId }
    });
    assert.equal(good.status, 0, good.stderr);
    const rendered = fs.readFileSync(outputPath, 'utf8');
    assert.match(rendered, new RegExp(validId));
    assert.doesNotMatch(rendered, /__TEST_D1_DATABASE_ID__/);
    assert.match(rendered, /database_name = "wealtharrays-saas-test"/);

    const bad = spawnSync(process.execPath, [path.join(root, 'scripts/render-wrangler-test-config.mjs')], {
      cwd: root,
      encoding: 'utf8',
      env: { ...process.env, TEST_D1_DATABASE_ID: 'not-a-uuid' }
    });
    assert.notEqual(bad.status, 0);
    assert.match(bad.stderr, /TEST_D1_DATABASE_ID/);
  } finally {
    fs.rmSync(outputPath, { force: true });
  }
});

test('TEST D1 verifier is read-only and distinguishes TEST from production', () => {
  const verifier = read('scripts/verify-test-d1-target.mjs');
  assert.match(verifier, /method:\s*'GET'/);
  assert.match(verifier, /wealtharrays-saas-test/);
  assert.match(verifier, /wealtharrays-saas/);
  assert.doesNotMatch(verifier, /method:\s*'POST'/);
  assert.doesNotMatch(verifier, /wrangler\s+d1\s+migrations\s+apply/);
});

test('SaaS setup keeps TEST webhook delivery off the production domain', () => {
  const setup = read('SAAS_SETUP.md');
  assert.match(setup, /Production-only webhook endpoint: `https:\/\/wealtharrays\.com\/v1\/billing\/webhook`/);
  assert.match(setup, /TEST webhook endpoint after successful TEST Worker deployment/);
  assert.match(setup, /https:\/\/wealtharrays-api-test\.goyalalok565\.workers\.dev\/v1\/billing\/webhook/);
  assert.match(setup, /Never send TEST events to this production-domain endpoint/);
});
