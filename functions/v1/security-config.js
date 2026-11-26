import { json } from "./_shared.js";

// The site key is public by design; never expose the verification secret.
export async function onRequestGet({ env }) {
  return json({
    configured: Boolean(env.TURNSTILE_SITE_KEY),
    site_key: env.TURNSTILE_SITE_KEY || null
  }, 200, { "Cache-Control": "no-store" });
}
export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,OPTIONS", "Access-Control-Allow-Headers": "Content-Type,Authorization,cf-turnstile-response" } });
}
