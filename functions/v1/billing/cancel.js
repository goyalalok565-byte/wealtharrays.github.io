import { authenticate } from "../_auth.js";
import { error, json } from "../_shared.js";
export async function onRequestOptions() { return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type,Authorization" } }); }
export async function onRequestPost({ request, env }) {
  const auth = await authenticate(request, env); if (auth.response) return auth.response;
  if (!env.DB || !env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) return error("BILLING_NOT_CONFIGURED", "Billing and subscription storage are not configured.", 503);
  try {
    const current = await env.DB.prepare("SELECT provider_subscription_id, plan_id, status, cancel_at_period_end FROM subscriptions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1").bind(auth.user.id).first();
    if (!current?.provider_subscription_id) return error("NO_SUBSCRIPTION", "No cancellable subscription was found.", 404);
    if (current.cancel_at_period_end) return json({ cancellation_scheduled: true, status: current.status, message: "Cancellation is already scheduled." });
    if (["cancelled", "completed", "halted"].includes(current.status)) return error("SUBSCRIPTION_NOT_ACTIVE", "This subscription cannot be cancelled from its current state.", 409);
    const response = await fetch("https://api.razorpay.com/v1/subscriptions/" + encodeURIComponent(current.provider_subscription_id) + "/cancel", {
      method: "POST",
      headers: { Authorization: "Basic " + btoa(env.RAZORPAY_KEY_ID + ":" + env.RAZORPAY_KEY_SECRET), "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ cancel_at_cycle_end: 1 })
    });
    const result = await response.json();
    if (!response.ok) return error("PAYMENT_PROVIDER_ERROR", "Razorpay could not schedule cancellation.", 502, { provider_status: response.status });
    await env.DB.prepare("UPDATE subscriptions SET cancel_at_period_end = 1, status = ?, current_period_end = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE provider_subscription_id = ? AND user_id = ?")
      .bind(result.status || current.status, result.current_end ? new Date(result.current_end * 1000).toISOString() : null, current.provider_subscription_id, auth.user.id).run();
    return json({ cancellation_scheduled: true, status: result.status || current.status, current_period_end: result.current_end ? new Date(result.current_end * 1000).toISOString() : null }, 200, { "Cache-Control": "no-store" });
  } catch { return error("BILLING_ERROR", "Could not schedule subscription cancellation.", 500); }
}
