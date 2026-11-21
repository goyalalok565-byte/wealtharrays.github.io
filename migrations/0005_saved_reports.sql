-- Reproducible, account-scoped report archive. Report payloads are private and deletable by their owner.
CREATE TABLE IF NOT EXISTS saved_reports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  model_version TEXT NOT NULL,
  currency TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  content_sha256 TEXT NOT NULL,
  report_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_saved_reports_user_created ON saved_reports(user_id, created_at DESC);
