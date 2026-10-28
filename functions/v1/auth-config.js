import { error, json } from "./_shared.js";
export async function onRequestGet({ env }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return error("AUTH_NOT_CONFIGURED", "Account sign-in has not been configured yet.", 503);
  return json({ provider: "supabase", url: env.SUPABASE_URL, anon_key: env.SUPABASE_ANON_KEY }, 200, { "Cache-Control": "no-store" });
}
export async function onRequestOptions() { return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,OPTIONS", "Access-Control-Allow-Headers": "Content-Type,Authorization" } }); }
