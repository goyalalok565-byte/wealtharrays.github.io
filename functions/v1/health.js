import { API_VERSION, CORS_HEADERS, json } from './_shared.js';

async function checkD1(env) {
  if (!env?.DB || typeof env.DB.prepare !== 'function') return { status: 'not_configured' };
  try {
    const result = await env.DB.prepare('SELECT 1 AS ok').first();
    return result?.ok === 1 ? { status: 'ok' } : { status: 'unhealthy' };
  } catch { return { status: 'unhealthy' }; }
}
async function checkSupabase(env) {
  const rawUrl = env?.SUPABASE_URL, anonKey = env?.SUPABASE_ANON_KEY;
  if (typeof rawUrl !== 'string' || typeof anonKey !== 'string' || !rawUrl || !anonKey) return { status: 'not_configured' };
  let endpoint;
  try { endpoint = new URL('/auth/v1/health', rawUrl); if (endpoint.protocol !== 'https:') return { status: 'invalid_configuration' }; }
  catch { return { status: 'invalid_configuration' }; }
  try {
    const response = await fetch(endpoint, { method: 'GET', headers: { apikey: anonKey }, signal: AbortSignal.timeout(2500) });
    return response.ok ? { status: 'ok' } : { status: 'unhealthy' };
  } catch { return { status: 'unhealthy' }; }
}
export async function onRequestGet({ env }) {
  const [d1, supabase] = await Promise.all([checkD1(env), checkSupabase(env)]);
  const checks = { d1, supabase };
  const status = Object.values(checks).every(check => check.status === 'ok') ? 'ok' : 'degraded';
  return json({ status, version: API_VERSION, checks, checked_at: new Date().toISOString() }, status === 'ok' ? 200 : 503, { 'Cache-Control': 'no-store' });
}
export async function onRequestOptions() { return new Response(null, { status: 204, headers: CORS_HEADERS }); }
