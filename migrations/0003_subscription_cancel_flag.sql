-- Add subscription cancellation scheduling state for Razorpay.
ALTER TABLE subscriptions ADD COLUMN cancel_at_period_end INTEGER NOT NULL DEFAULT 0;
