const test = require('node:test');
const assert = require('node:assert/strict');
test('deployment path policy excludes repository-only and backup artifacts', async () => {
  const { isForbiddenDeploymentPath } = await import('../scripts/deployment-path-policy.mjs');
  for (const path of ['qa/audit.mjs', 'scripts/build.mjs', 'docs/PROJECT_STATE.md', 'tests/unit.test.js', '.github/workflows/ci.yml', 'backups/site.zip', 'restore.bak', 'package.json', 'wrangler.toml']) {
    assert.equal(isForbiddenDeploymentPath(path), true, path + ' must never be deployed');
  }
});
test('deployment path policy preserves approved public site assets and research data', async () => {
  const { isForbiddenDeploymentPath } = await import('../scripts/deployment-path-policy.mjs');
  for (const path of ['index.html', 'sip-calculator/index.html', 'articles/guide.html', 'research/data/study.json', 'calculator-definitions/sip.js', '.well-known/security.txt', '_headers', '_redirects']) {
    assert.equal(isForbiddenDeploymentPath(path), false, path + ' should remain eligible for deployment');
  }
});
