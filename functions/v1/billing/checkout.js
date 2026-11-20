import { authenticate, ensureProfile } from "../_auth.js";
import { error, json } from "../_shared.js";

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type,Authorization" } });
}

export async function onRequestPost({ request, env }) {
  const auth = await authenticate(request, env);
  if (auth.response) return auth.response;
  if (!env.DB) return error("DATABASE_NOT_CONFIGURED", "Subscription storage is not configured.", 503);
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) return error("BILLING_NOT_CONFIGURED", "Razorpay credentials are not configured for this deployment.", 503);

  let body;
  try { body = await request.json(); } catch { return error("INVALID_JSON", "Request body must be valid JSON.", 400); }
  const plan = body?.plan;
  const planId = plan === "monthly" ? env.RAZORPAY_PLAN_MONTHLY : plan === "yearly" ? env.RAZORPAY_PLAN_YEARLY : null;
  if (!planId) return error("INVALID_PLAN", "Choose a configured monthly or yearly plan.", 400);

  try {
    await ensureProfile(env, auth.user);
    const providerAuth = "Basic " + btoa(env.RAZORPAY_KEY_ID + ":" + env.RAZORPAY_KEY_SECRET);
    const active = await env.DB.prepare(
      "SELECT status, current_period_end FROM subscriptions WHERE user_id = ? AND provider = 'razorpay' AND status = 'active' ORDER BY updated_at DESC LIMIT 1"
    ).bind(auth.user.id).first();
    if (active && (!active.current_period_end || Date.parse(active.current_period_end) > Date.now())) {
      return error("SUBSCRIPTION_ALREADY_ACTIVE", "An active subscription already exists for this account.", 409);
    }

    const pending = await env.DB.prepare(
      "SELECT provider_subscription_id, plan_id, status FROM subscriptions WHERE user_id = ? AND provider = 'razorpay' AND status IN ('created','pending','authenticated') ORDER BY updated_at DESC LIMIT 1"
    ).bind(auth.user.id).first();
    if (pending?.provider_subscription_id) {
      if (pending.plan_id !== plan) {
        return error("CHECKOUT_ALREADY_PENDING", "Finish or resolve the existing checkout before choosing another plan.", 409);
      }
      const existingResponse = await fetch("https://api.razorpay.com/v1/subscriptions/" + encodeURIComponent(pending.provider_subscription_id), {
        headers: { Authorization: providerAuth, Accept: "application/json" }
      }).catch(() => null);
      if (!existingResponse) {
        return error("CHECKOUT_ALREADY_PENDING", "The existing checkout could not be verified. Please retry shortly; a second subscription will not be created.", 409);
      }
      const existing = await existingResponse.json().catch(() => null);
      if (existingResponse.ok && existing?.short_url && !["cancelled", "completed", "halted"].includes(existing.status)) {
        return json({ checkout_url: existing.short_url, subscription_id: existing.id, key_id: env.RAZORPAY_KEY_ID, plan }, 200, { "Cache-Control": "no-store" });
      }
      if (!existingResponse.ok || !existing || !["cancelled", "completed", "halted"].includes(existing.status)) {
        return error("CHECKOUT_ALREADY_PENDING", "The existing checkout state is uncertain. Please contact support before starting another subscription.", 409);
      }
      await env.DB.prepare(
        "UPDATE subscriptions SET status = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE provider = 'razorpay' AND provider_subscription_id = ? AND user_id = ?"
      ).bind(existing.status, pending.provider_subscription_id, auth.user.id).run();
    }

    const lockToken = crypto.randomUUID();
    const lock = await env.DB.prepare(
      "INSERT OR IGNORE INTO billing_checkout_locks (user_id, plan_id, lock_token) VALUES (?, ?, ?)"
    ).bind(auth.user.id, plan, lockToken).run();
    if (!lock.meta?.changes) {
      return error("CHECKOUT_IN_PROGRESS", "A subscription checkout is already being created or requires reconciliation. Do not retry repeatedly; contact support if this persists.", 409);
    }

    let response;
    try {
      response = await fetch("https://api.razorpay.com/v1/subscriptions", {
        method: "POST",
        headers: { Authorization: providerAuth, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ plan_id: planId, customer_notify: 1, total_count: plan === "monthly" ? 100 : 10, notes: { user_id: auth.user.id, plan } })
      });
    } catch {
      // The provider may have accepted the request before the connection failed.
      // Keep the lock so a retry cannot create a second subscription.
      return error("CHECKOUT_RECOVERY_REQUIRED", "The payment provider response was interrupted. A duplicate checkout has been blocked; support must reconcile the provider state before retrying.", 503);
    }

    const subscription = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status < 500) {
        await env.DB.prepare("DELETE FROM billing_checkout_locks WHERE user_id = ? AND lock_token = ?").bind(auth.user.id, lockToken).run();
        return error("PAYMENT_PROVIDER_ERROR", "Razorpay could not create a checkout subscription.", 502, { provider_status: response.status });
      }
      // A 5xx response can be ambiguous; retain the lock until reconciliation.
      return error("CHECKOUT_RECOVERY_REQUIRED", "Razorpay returned an uncertain response. A duplicate checkout has been blocked; support must reconcile the provider state before retrying.", 503);
    }
    if (!subscription?.id || !subscription?.short_url) {
      return error("CHECKOUT_RECOVERY_REQUIRED", "Razorpay returned an incomplete checkout response. A duplicate checkout has been blocked pending reconciliation.", 503);
    }

    const id = crypto.randomUUID();
    await env.DB.prepare(
      "INSERT INTO subscriptions (id, user_id, provider, provider_subscription_id, plan_id, status, current_period_end) VALUES (?, ?, 'razorpay', ?, ?, ?, ?)"
    ).bind(id, auth.user.id, subscription.id, plan, subscription.status || "created", subscription.current_end ? new Date(subscription.current_end * 1000).toISOString() : null).run();
    await env.DB.prepare("DELETE FROM billing_checkout_locks WHERE user_id = ? AND lock_token = ?").bind(auth.user.id, lockToken).run();
    return json({ checkout_url: subscription.short_url, subscription_id: subscription.id, key_id: env.RAZORPAY_KEY_ID, plan }, 201, { "Cache-Control": "no-store" });
  } catch {
    // Leave any acquired lock in place after an ambiguous storage/provider failure.
    return error("BILLING_ERROR", "Could not safely complete subscription checkout. If this persists, contact support before retrying.", 500);
  }
}
