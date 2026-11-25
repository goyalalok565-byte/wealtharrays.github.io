const token = String(process.env.TEST_CLOUDFLARE_API_TOKEN || '').trim();
const accountId = String(process.env.TEST_CLOUDFLARE_ACCOUNT_ID || '').trim();
const testDatabaseId = String(process.env.TEST_D1_DATABASE_ID || '').trim();

if (!token || !accountId || !testDatabaseId) {
  throw new Error('TEST Cloudflare token, account ID and D1 database ID are required.');
}

const endpoint = new URL(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/d1/database`);
endpoint.searchParams.set('per_page', '100');

const response = await fetch(endpoint, {
  method: 'GET',
  headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
});
if (!response.ok) {
  throw new Error(`Cloudflare D1 target lookup failed with HTTP ${response.status}.`);
}

const payload = await response.json();
if (payload.success !== true || !Array.isArray(payload.result)) {
  throw new Error('Cloudflare did not return a successful D1 database inventory.');
}

const databases = payload.result;
const testMatches = databases.filter(database => database.name === 'wealtharrays-saas-test');
const productionMatches = databases.filter(database => database.name === 'wealtharrays-saas');

if (testMatches.length !== 1 || testMatches[0].uuid !== testDatabaseId) {
  throw new Error('TEST_D1_DATABASE_ID does not identify the dedicated wealtharrays-saas-test database.');
}
if (productionMatches.length !== 1 || productionMatches[0].uuid === testDatabaseId) {
  throw new Error('TEST D1 target is missing or is not distinct from the production database.');
}

console.log('TEST D1 database identity verified; production database is a different resource.');
