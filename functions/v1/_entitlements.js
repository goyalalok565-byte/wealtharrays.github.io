export const FREE_SCENARIO_LIMIT = 3;
export const MAX_SCENARIO_LIMIT = 500;

/**
 * Resolve server-authoritative access from the latest persisted subscription.
 * Pro access requires an explicit, valid paid-through timestamp. A cancellation
 * scheduled for period end remains active only until that timestamp.
 */
export function resolveEntitlement(subscription, now = Date.now()) {
  const end = Date.parse(subscription?.current_period_end || "");
  const periodValid = Number.isFinite(end) && end > now;
  const active = subscription?.status === "active" && periodValid;
  return {
    tier: active ? "pro" : "free",
    active,
    plan_id: active ? (subscription.plan_id || null) : null,
    cloud_scenario_limit: active ? MAX_SCENARIO_LIMIT : FREE_SCENARIO_LIMIT,
    features: {
      cloud_scenario_sync: true,
      cross_device_scenarios: true,
      expanded_scenario_library: active
    }
  };
}

export async function getEntitlement(env, userId) {
  if (!env?.DB) throw new Error("D1 database is not configured.");
  const subscription = await env.DB.prepare(
    "SELECT plan_id, status, current_period_end FROM subscriptions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1"
  ).bind(userId).first();
  return resolveEntitlement(subscription);
}
