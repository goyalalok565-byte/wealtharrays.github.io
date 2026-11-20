export const FREE_SCENARIO_LIMIT = 3;
export const MAX_SCENARIO_LIMIT = 500;
export const FREE_REPORT_LIMIT = 1;
export const MAX_REPORT_LIMIT = 100;

/**
 * Resolve server-authoritative access from a paid subscription or a one-time trial.
 * Paid access fails closed unless the provider-backed billing period has a valid future end.
 * A cancellation scheduled for period end remains active only until that end.
 */
export function resolveEntitlement(subscription, now = Date.now(), trial = null) {
  const end = subscription?.current_period_end ? Date.parse(subscription.current_period_end) : NaN;
  const periodValid = Number.isFinite(end) && end > now;
  const paidActive = subscription?.status === "active" && periodValid;
  const trialEnd = trial?.ends_at ? Date.parse(trial.ends_at) : null;
  const trialActive = Boolean(trial && Number.isFinite(trialEnd) && trialEnd > now);
  const active = paidActive || trialActive;
  const trialStatus = !trial ? "available" : trialActive ? "active" : "expired";
  return {
    tier: active ? "pro" : "free",
    active,
    source: paidActive ? "subscription" : trialActive ? "trial" : null,
    plan_id: paidActive ? (subscription.plan_id || null) : trialActive ? "pro-trial" : null,
    cloud_scenario_limit: active ? MAX_SCENARIO_LIMIT : FREE_SCENARIO_LIMIT,
    cloud_report_limit: active ? MAX_REPORT_LIMIT : FREE_REPORT_LIMIT,
    trial: { status: trialStatus, ends_at: trial?.ends_at || null },
    features: {
      cloud_scenario_sync: true,
      cross_device_scenarios: true,
      expanded_scenario_library: active,
      saved_report_archive: active
    }
  };
}

export async function getEntitlement(env, userId) {
  if (!env?.DB) throw new Error("D1 database is not configured.");
  const [subscription, trial] = await Promise.all([
    env.DB.prepare(
      "SELECT plan_id, status, current_period_end FROM subscriptions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1"
    ).bind(userId).first(),
    env.DB.prepare(
      "SELECT started_at, ends_at FROM pro_trials WHERE user_id = ? LIMIT 1"
    ).bind(userId).first()
  ]);
  return resolveEntitlement(subscription, Date.now(), trial);
}
