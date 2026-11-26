import { authenticate, ensureProfile } from "../_auth.js";
import { error, json, enforceRateLimit } from "../_shared.js";

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type,Authorization,cf-turnstile-response" } });
}

const PROVIDER_URL = "https://api.razorpay.com/v1/subscriptions";

function checkoutError() {
  return error("CHECKOUT_ALREADY_PENDING", "A checkout request is already being processed or needs reconciliation. Do not start another payment; retry shortly or contact support if this continues.", 409);
}

async function fetchProviderSubscription(id, providerAuth) {
  const response = await fetch(PROVIDER_URL + "/" + encodeURIComponent(id), {
    headers: { Authorization: providerAuth, Accept: "application/json" }
  });
  let subscription = null;
  try { subscription = await response.json(); } catch {}
  return { response, subscription };
}

async function persistProviderSubscription(env, userId, plan, subscription) {
  if (!subscription?.id) throw new Error("Provider subscription id is missing.");
  await env.DB.prepare(
    "INSERT OR IGNORE INTO subscriptions (id, user_id, provider, provider_subscription_id, plan_id, status, current_period_end) VALUES (?, ?, 'razorpay', ?, ?, ?, ?)"
  ).bind(
    crypto.randomUUID(),
    userId,
    subscription.id,
    plan,
    subscription.status || "created",
    subscription.current_end ? new Date(subscription.current_end * 1000).toISOString() : null
  ).run();
}

async function releaseCheckoutLock(env, userId, attemptId) {
  await env.DB.prepare("DELETE FROM billing_checkout_locks WHERE user_id = ? AND attempt_id = ?")
    .bind(userId, attemptId).run();
}

export async function onRequestPost({ request, env }) {
  const auth = await authenticate(request, env);
  if (auth.response) return auth.response;
  const limited = await enforceRateLimit(env, `billing-checkout:${auth.user.id}`);
  if (limited) return limited;
  if (!env.DB) return error("DATABASE_NOT_CONFIGURED", "Subscription storage is not configured.", 503);
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) return error("BILLING_NOT_CONFIGURED", "Razorpay credentials are not configured for this deployment.", 503);

  let body;
  try { body = await request.json(); } catch { return error("INVALID_JSON", "Request body must be valid JSON.", 400); }
  const plan = body?.plan;
  const planId = plan === "monthly" ? env.RAZORPAY_PLAN_MONTHLY : plan === "yearly" ? env.RAZORPAY_PLAN_YEARLY : null;
  if (!planId) return error("INVALID_PLAN", "Choose a configured monthly or yearly plan.", 400);

  const providerAuth = "Basic " + btoa(env.RAZORPAY_KEY_ID + ":" + env.RAZORPAY_KEY_SECRET);
  const userId = auth.user.id;

  try {
    await ensureProfile(env, auth.user);

    const active = await env.DB.prepare(
      "SELECT status, current_period_end FROM subscriptions WHERE user_id = ? AND provider = 'razorpay' AND status = 'active' ORDER BY updated_at DESC LIMIT 1"
    ).bind(userId).first();
    if (active && (!active.current_period_end || Date.parse(active.current_period_end) > Date.now())) {
      return error("SUBSCRIPTION_ALREADY_ACTIVE", "An active subscription already exists for this account.", 409);
    }

    // Reuse legacy pending subscriptions created before checkout locks were introduced.
    const pending = await env.DB.prepare(
      "SELECT provider_subscription_id, plan_id, status FROM subscriptions WHERE user_id = ? AND provider = 'razorpay' AND status IN ('created','pending','authenticated') ORDER BY created_at DESC LIMIT 1"
    ).bind(userId).first();
    if (pending?.provider_subscription_id) {
      if (pending.plan_id !== plan) return error("CHECKOUT_ALREADY_PENDING", "Finish or resolve the existing checkout before choosing another plan.", 409);
      const existing = await fetchProviderSubscription(pending.provider_subscription_id, providerAuth);
      if (existing.response.ok && existing.subscription?.short_url) {
        return json({ checkout_url: existing.subscription.short_url, subscription_id: existing.subscription.id, key_id: env.RAZORPAY_KEY_ID, plan }, 200, { "Cache-Control": "no-store" });
      }
      return checkoutError();
    }

    // A single D1 primary-key insert serializes checkout creation per user.
    // The lock is deliberately not auto-expired: a timed-out provider request may
    // have created a remote subscription even when this Worker never received it.
    const attemptId = crypto.randomUUID();
    const claim = await env.DB.prepare(
      "INSERT OR IGNORE INTO billing_checkout_locks (user_id, plan_id, attempt_id, status) VALUES (?, ?, ?, 'creating')"
    ).bind(userId, plan, attemptId).run();

    if (!claim.meta?.changes) {
      const existingLock = await env.DB.prepare(
        "SELECT plan_id, attempt_id, status, provider_subscription_id FROM billing_checkout_locks WHERE user_id = ?"
      ).bind(userId).first();
      if (!existingLock || existingLock.plan_id !== plan) return checkoutError();
      if (!existingLock.provider_subscription_id) return checkoutError();

      // Recover a provider subscription created before a prior local D1 write failed.
      const recovered = await fetchProviderSubscription(existingLock.provider_subscription_id, providerAuth);
      if (!recovered.response.ok || !recovered.subscription?.id || !recovered.subscription?.short_url) return checkoutError();
      await persistProviderSubscription(env, userId, plan, recovered.subscription);
      await releaseCheckoutLock(env, userId, existingLock.attempt_id);
      return json({ checkout_url: recovered.subscription.short_url, subscription_id: recovered.subscription.id, key_id: env.RAZORPAY_KEY_ID, plan }, 200, { "Cache-Control": "no-store" });
    }

    let response;
    try {
      response = await fetch(PROVIDER_URL, {
        method: "POST",
        headers: { Authorization: providerAuth, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ plan_id: planId, customer_notify: 1, total_count: plan === "monthly" ? 100 : 10, notes: { user_id: userId, plan, checkout_attempt_id: attemptId } })
      });
    } catch {
      // Outcome is unknown. Keep the lock to prevent a duplicate remote subscription.
      return checkoutError();
    }

    let subscription = null;
    try { subscription = await response.json(); } catch {}
    if (!response.ok) {
      // Definitive client-side rejection did not create a subscription. A timeout
      // or server error is ambiguous, so retain the lock for safe reconciliation.
      if (response.status >= 400 && response.status < 500 && response.status !== 408) {
        await releaseCheckoutLock(env, userId, attemptId);
      }
      return error("PAYMENT_PROVIDER_ERROR", "Razorpay could not confirm checkout creation. Please retry only after the pending request is resolved.", response.status >= 500 || response.status === 408 ? 502 : 400, { provider_status: response.status });
    }
    if (!subscription?.id) return checkoutError();

    // Persist the remote id in the lock before writing the subscription row.
    // If the following D1 insert fails, the next request can fetch and recover it.
    await env.DB.prepare(
      "UPDATE billing_checkout_locks SET provider_subscription_id = ?, status = 'reconcile', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE user_id = ? AND attempt_id = ?"
    ).bind(subscription.id, userId, attemptId).run();

    if (!subscription.short_url) return checkoutError();
    await persistProviderSubscription(env, userId, plan, subscription);
    await releaseCheckoutLock(env, userId, attemptId);
    return json({ checkout_url: subscription.short_url, subscription_id: subscription.id, key_id: env.RAZORPAY_KEY_ID, plan }, 201, { "Cache-Control": "no-store" });
  } catch {
    // Never clear an acquired lock on an unexpected error: a provider request
    // may already have succeeded, so manual/retry reconciliation is safer.
    return error("BILLING_ERROR", "Could not complete checkout safely. The pending attempt must be resolved before another subscription is created.", 500);
  }
}
