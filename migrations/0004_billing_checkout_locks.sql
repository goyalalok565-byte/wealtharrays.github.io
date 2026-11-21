-- Serialize subscription creation per account to prevent concurrent duplicate provider subscriptions.
CREATE TABLE IF NOT EXISTS billing_checkout_locks (
  user_id TEXT PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  lock_token TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
