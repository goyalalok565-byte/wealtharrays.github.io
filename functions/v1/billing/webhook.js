import { error, json } from "../_shared.js";
const hex = bytes => Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, "0")).join("");
function constantTimeEqual(a, b) { if (a.length !== b.length) return false; let diff = 0; for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i); return diff === 0; }
export async function onRequestPost({ request, env }) {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return error("WEBHOOK_NOT_CONFIGURED", "Razorpay webhook secret is not configured.", 503);
  if (!env.DB) return error("DATABASE_NOT_CONFIGURED", "Billing event storage is not configured.", 503);
  const raw = await request.text(), signature = request.headers.get("x-razorpay-signature") || "";
  try {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.RAZORPAY_WEBHOOK_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const expected = hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw)));
    if (!constantTimeEqual(expected, signature.toLowerCase())) return error("INVALID_SIGNATURE", "Webhook signature verification failed.", 401);
  } catch { return error("SIGNATURE_ERROR", "Could not verify webhook signature.", 401); }
  let event; try { event = JSON.parse(raw); } catch { return error("INVALID_JSON", "Webhook body must be valid JSON.", 400); }
  if (!event.id || !event.event) return error("INVALID_EVENT", "Webhook event id and type are required.", 400);
  const entity = event.payload?.subscription?.entity || event.payload?.subscription?.subscription || null;
  const safePayload = JSON.stringify({ subscription_id: entity?.id || null, status: entity?.status || null, current_end: entity?.current_end || null });
  try {
    await env.DB.prepare("INSERT OR IGNORE INTO billing_events (id, provider, provider_event_id, event_type, payload_json, processed_at) VALUES (?, 'razorpay', ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))")
      .bind(crypto.randomUUID(), event.id, event.event, safePayload).run();
    if (entity?.id) {
      const map = { "subscription.activated": "active", "subscription.charged": "active", "subscription.pending": "pending", "subscription.halted": "halted", "subscription.cancelled": "cancelled", "subscription.completed": "completed" };
      const status = map[event.event];
      if (status) await env.DB.prepare("UPDATE subscriptions SET status = ?, current_period_end = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE provider = 'razorpay' AND provider_subscription_id = ?")
        .bind(status, entity.current_end ? new Date(entity.current_end * 1000).toISOString() : null, entity.id).run();
    }
    return json({ received: true }, 200, { "Cache-Control": "no-store" });
  } catch { return error("WEBHOOK_STORAGE_ERROR", "Could not record the billing event.", 500); }
}
