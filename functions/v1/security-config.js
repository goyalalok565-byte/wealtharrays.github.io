import { json } from "./_shared.js";

// Turnstile's site key is public by design; the verification secret is never returned.
export async function onRequestGet({ env }) {
  return json({ configured: Boolean(env.TURNSTILE_SITE_KEY), site_key: env.TURNSTILE_SITE_KEY || null }, 200, { "Cache-Control": "no-store" });
}
export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Methods": "GET,OPTIONS" } });
}
