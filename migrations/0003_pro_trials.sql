-- One-time Pro trial claims. A normalized verified-email digest prevents repeat claims across duplicate accounts.
CREATE TABLE IF NOT EXISTS pro_trials (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  email_hash TEXT NOT NULL UNIQUE,
  started_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_pro_trials_user_end ON pro_trials(user_id, ends_at);
