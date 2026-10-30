-- Preserve Razorpay event ordering so delayed webhooks cannot overwrite newer state.
ALTER TABLE subscriptions ADD COLUMN last_provider_event_at INTEGER;
