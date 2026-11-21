import { authenticate, ensureProfile } from "../_auth.js";
import { error, json, CORS_HEADERS } from "../_shared.js";
import { getEntitlement } from "../_entitlements.js";

const TRIAL_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

async function emailDigest(email) {
  const normalized = email.trim().toLowerCase();
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalized));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost({ request, env }) {
  const auth = await authenticate(request, env);
  if (auth.response) return auth.response;
  if (!env.DB) return error("DATABASE_NOT_CONFIGURED", "Trial storage is not configured.", 503);
  if (!auth.user.email || !auth.user.email_verified) {
    return error("EMAIL_VERIFICATION_REQUIRED", "Confirm your email address before starting the 14-day Pro trial.", 403);
  }

  try {
    await ensureProfile(env, auth.user);
    const current = await getEntitlement(env, auth.user.id);
    if (current.source === "subscription") {
      return error("SUBSCRIPTION_ALREADY_ACTIVE", "Your account already has an active Pro subscription.", 409);
    }
    if (current.trial.status !== "available") {
      return error("TRIAL_ALREADY_CLAIMED", "The one-time Pro trial has already been used or has expired for this verified email.", 409);
    }

    const now = Date.now();
    const startedAt = new Date(now).toISOString();
    const endsAt = new Date(now + TRIAL_DAYS * DAY_MS).toISOString();
    const emailHash = await emailDigest(auth.user.email);
    const inserted = await env.DB.prepare(
      "INSERT OR IGNORE INTO pro_trials (id, user_id, email_hash, started_at, ends_at) VALUES (?, ?, ?, ?, ?)"
    ).bind(crypto.randomUUID(), auth.user.id, emailHash, startedAt, endsAt).run();

    if (!inserted.meta?.changes) {
      return error("TRIAL_ALREADY_CLAIMED", "The one-time Pro trial has already been used or has expired for this verified email.", 409);
    }

    const entitlement = await getEntitlement(env, auth.user.id);
    return json({
      trial_started: true,
      trial_days: TRIAL_DAYS,
      started_at: startedAt,
      ends_at: endsAt,
      entitlement
    }, 201, { "Cache-Control": "no-store" });
  } catch {
    return error("TRIAL_ERROR", "Could not start the Pro trial. Please retry later.", 500);
  }
}
