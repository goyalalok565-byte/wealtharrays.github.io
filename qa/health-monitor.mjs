const base = (process.env.BASE_URL || 'https://wealtharrays.com').replace(/\/$/, '');
const response = await fetch(base + '/v1/health', { cache: 'no-store', signal: AbortSignal.timeout(15000) });
let payload;
try { payload = await response.json(); } catch { throw new Error('Health endpoint returned non-JSON content.'); }
if (!response.ok) throw new Error('Health endpoint returned HTTP ' + response.status + ': ' + JSON.stringify(payload));
if (payload.status !== 'ok' || payload.service !== 'wealth-arrays-api' || !payload.version) {
  throw new Error('Health endpoint returned an invalid liveness response: ' + JSON.stringify(payload));
}
if (!payload.dependencies || !Object.hasOwn(payload.dependencies, 'd1_database') || !Object.hasOwn(payload.dependencies, 'supabase_auth') || !Object.hasOwn(payload.dependencies, 'razorpay_billing') || !Object.hasOwn(payload.dependencies, 'write_api_rate_limiter') || !Object.hasOwn(payload.dependencies, 'turnstile')) {
  throw new Error('Health endpoint omitted dependency readiness indicators.');
}
console.log('Wealth Arrays API health PASS — version ' + payload.version + ', SaaS readiness=' + Boolean(payload.ready_for_saas) + ', D1=' + payload.dependencies.d1_database + ', auth=' + payload.dependencies.supabase_auth + ', billing=' + payload.dependencies.razorpay_billing + ', writeLimiter=' + payload.dependencies.write_api_rate_limiter + ', turnstile=' + payload.dependencies.turnstile);
