import { authenticate, ensureProfile } from "../_auth.js";
import { error, json } from "../_shared.js";
export async function onRequestOptions() { return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type,Authorization" } }); }
export async function onRequestPost({ request, env }) {
  const auth = await authenticate(request, env); if (auth.response) return auth.response;
  if (!env.DB) return error("DATABASE_NOT_CONFIGURED", "Subscription storage is not configured.", 503);
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) return error("BILLING_NOT_CONFIGURED", "Razorpay credentials are not configured for this deployment.", 503);
  let body; try { body = await request.json(); } catch { return error("INVALID_JSON", "Request body must be valid JSON.", 400); }
  const plan = body?.plan;
  const planId = plan === "monthly" ? env.RAZORPAY_PLAN_MONTHLY : plan === "yearly" ? env.RAZORPAY_PLAN_YEARLY : null;
  if (!planId) return error("INVALID_PLAN", "Choose a configured monthly or yearly plan.", 400);
  try {
    await ensureProfile(env, auth.user);
    const providerAuth = "Basic " + btoa(env.RAZORPAY_KEY_ID + ":" + env.RAZORPAY_KEY_SECRET);
    const active = await env.DB.prepare("SELECT status, current_period_end FROM subscriptions WHERE user_id = ? AND provider = 'razorpay' AND status = 'active' ORDER BY updated_at DESC LIMIT 1").bind(auth.user.id).first();
    if (active && (!active.current_period_end || Date.parse(active.current_period_end) > Date.now())) {
      return error("SUBSCRIPTION_ALREADY_ACTIVE", "An active subscription already exists for this account.", 409);
    }
    const pending = await env.DB.prepare("SELECT provider_subscription_id, plan_id, status, created_at FROM subscriptions WHERE user_id = ? AND provider = 'razorpay' AND status IN ('created','pending','authenticated') ORDER BY created_at DESC LIMIT 1").bind(auth.user.id).first();
    if (pending && pending.provider_subscription_id && Date.now() - Date.parse(pending.created_at) < 30 * 60 * 1000) {
      if (pending.plan_id !== plan) return error("CHECKOUT_ALREADY_PENDING", "Finish or wait for the existing checkout before choosing another plan.", 409);
      const existingResponse = await fetch("https://api.razorpay.com/v1/subscriptions/" + encodeURIComponent(pending.provider_subscription_id), {
        headers: { Authorization: providerAuth, Accept: "application/json" }
      });
      const existing = await existingResponse.json();
      if (existingResponse.ok && existing.short_url) {
        return json({ checkout_url: existing.short_url, subscription_id: existing.id, key_id: env.RAZORPAY_KEY_ID, plan }, 200, { "Cache-Control": "no-store" });
      }
      return error("CHECKOUT_ALREADY_PENDING", "An existing checkout is still pending. Please retry shortly instead of creating another subscription.", 409);
    }
    const response = await fetch("https://api.razorpay.com/v1/subscriptions", {
      method: "POST",
      headers: { Authorization: providerAuth, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ plan_id: planId, customer_notify: 1, total_count: plan === "monthly" ? 100 : 10, notes: { user_id: auth.user.id, plan } })
    });
    const subscription = await response.json();
    if (!response.ok || !subscription.id || !subscription.short_url) return error("PAYMENT_PROVIDER_ERROR", "Razorpay could not create a checkout subscription.", 502, { provider_status: response.status });
    const id = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO subscriptions (id, user_id, provider, provider_subscription_id, plan_id, status, current_period_end) VALUES (?, ?, 'razorpay', ?, ?, ?, ?)")
      .bind(id, auth.user.id, subscription.id, plan, subscription.status || "created", subscription.current_end ? new Date(subscription.current_end * 1000).toISOString() : null).run();
    return json({ checkout_url: subscription.short_url, subscription_id: subscription.id, key_id: env.RAZORPAY_KEY_ID, plan }, 201, { "Cache-Control": "no-store" });
  } catch { return error("BILLING_ERROR", "Could not create a subscription checkout.", 500); }
}
