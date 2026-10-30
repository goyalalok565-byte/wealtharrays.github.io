import { error, json } from "../_shared.js";

const hex = bytes => Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, "0")).join("");
function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
const SUBSCRIPTION_STATUS = {
  "subscription.authenticated": "authenticated",
  "subscription.activated": "active",
  "subscription.charged": "active",
  "subscription.pending": "pending",
  "subscription.halted": "halted",
  "subscription.cancelled": "cancelled",
  "subscription.completed": "completed",
  "subscription.paused": "paused",
  "subscription.resumed": "active"
};
export async function onRequestPost({ request, env }) {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return error("WEBHOOK_NOT_CONFIGURED", "Razorpay webhook secret is not configured.", 503);
  if (!env.DB) return error("DATABASE_NOT_CONFIGURED", "Billing event storage is not configured.", 503);
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";
  try {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.RAZORPAY_WEBHOOK_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const expected = hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw)));
    if (!constantTimeEqual(expected, signature.toLowerCase())) return error("INVALID_SIGNATURE", "Webhook signature verification failed.", 401);
  } catch {
    return error("SIGNATURE_ERROR", "Could not verify webhook signature.", 401);
  }
  let event;
  try { event = JSON.parse(raw); } catch { return error("INVALID_JSON", "Webhook body must be valid JSON.", 400); }
  const eventId = request.headers.get("x-razorpay-event-id") || event?.id;
  if (!eventId || typeof eventId !== "string" || !event?.event || typeof event.event !== "string") {
    return error("INVALID_EVENT", "A Razorpay event id and event type are required.", 400);
  }
  const subscription = event.payload?.subscription?.entity || event.payload?.subscription?.subscription || null;
  const payment = event.payload?.payment?.entity || null;
  const subscriptionId = subscription?.id || payment?.subscription_id || null;
  const eventCreatedAt = Number.isSafeInteger(event.created_at) && event.created_at > 0 ? event.created_at : null;
  const safePayload = JSON.stringify({
    subscription_id: subscriptionId,
    subscription_status: subscription?.status || null,
    current_end: subscription?.current_end || null,
    payment_id: payment?.id || null,
    payment_status: payment?.status || null,
    payment_amount: Number.isFinite(payment?.amount) ? payment.amount : null,
    payment_currency: payment?.currency || null,
    payment_amount_refunded: Number.isFinite(payment?.amount_refunded) ? payment.amount_refunded : null
  });
  try {
    const inserted = await env.DB.prepare("INSERT OR IGNORE INTO billing_events (id, provider, provider_event_id, event_type, payload_json, processed_at) VALUES (?, 'razorpay', ?, ?, ?, NULL)")
      .bind(crypto.randomUUID(), eventId, event.event, safePayload).run();
    if (!inserted.meta?.changes) {
      const existing = await env.DB.prepare("SELECT processed_at FROM billing_events WHERE provider = 'razorpay' AND provider_event_id = ?")
        .bind(eventId).first();
      if (existing?.processed_at) return json({ received: true, duplicate: true }, 200, { "Cache-Control": "no-store" });
    }
    const status = SUBSCRIPTION_STATUS[event.event];
    if (subscriptionId && status) {
      const currentEnd = subscription?.current_end ? new Date(subscription.current_end * 1000).toISOString() : null;
      const updateSql = [
        "UPDATE subscriptions",
        "SET status = ?, current_period_end = COALESCE(?, current_period_end),",
        "last_provider_event_at = CASE WHEN ? IS NULL THEN last_provider_event_at ELSE ? END,",
        "updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')",
        "WHERE provider = 'razorpay' AND provider_subscription_id = ?",
        "AND ((? IS NOT NULL AND (last_provider_event_at IS NULL OR last_provider_event_at <= ?))",
        "OR (? IS NULL AND last_provider_event_at IS NULL))"
      ].join(" ");
      const updated = await env.DB.prepare(updateSql)
        .bind(status, currentEnd, eventCreatedAt, eventCreatedAt, subscriptionId, eventCreatedAt, eventCreatedAt, eventCreatedAt).run();
      if (!updated.meta?.changes) {
        const linked = await env.DB.prepare("SELECT id FROM subscriptions WHERE provider = 'razorpay' AND provider_subscription_id = ?")
          .bind(subscriptionId).first();
        if (!linked) return error("SUBSCRIPTION_NOT_LINKED", "The subscription event is valid but its local subscription record is not available yet.", 503);
      }
    }
    await env.DB.prepare("UPDATE billing_events SET processed_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE provider = 'razorpay' AND provider_event_id = ? AND processed_at IS NULL")
      .bind(eventId).run();
    // payment.failed and payment.refunded are recorded with safe payment metadata.
    // Subscription lifecycle events remain authoritative for subscription entitlement.
    return json({ received: true }, 200, { "Cache-Control": "no-store" });
  } catch {
    return error("WEBHOOK_STORAGE_ERROR", "Could not record or process the billing event.", 500);
  }
}
