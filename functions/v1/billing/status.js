import { authenticate } from "../_auth.js";
import { error, json } from "../_shared.js";
export async function onRequestOptions() { return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,OPTIONS", "Access-Control-Allow-Headers": "Content-Type,Authorization" } }); }
export async function onRequestGet({ request, env }) {
  const auth = await authenticate(request, env); if (auth.response) return auth.response;
  if (!env.DB) return error("DATABASE_NOT_CONFIGURED", "Subscription storage is not configured.", 503);
  try {
    const subscription = await env.DB.prepare("SELECT plan_id, status, current_period_end, cancel_at_period_end FROM subscriptions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1").bind(auth.user.id).first();
    return json({ subscription: subscription || null }, 200, { "Cache-Control": "no-store" });
  } catch { return error("DATABASE_ERROR", "Could not load subscription status.", 500); }
}
