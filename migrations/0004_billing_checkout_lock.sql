-- Serialize Razorpay subscription creation per user.
-- A lock with an unknown provider outcome is intentionally retained until reconciled;
-- automatic expiry could create duplicate remote subscriptions after a timeout.
CREATE TABLE IF NOT EXISTS billing_checkout_locks (
  user_id TEXT PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL CHECK(plan_id IN ('monthly','yearly')),
  attempt_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK(status IN ('creating','reconcile')),
  provider_subscription_id TEXT UNIQUE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
