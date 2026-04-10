-- Migration 002: add claimed_at column for claim tracking
-- claimed_at is NULL when unclaimed, set to the timestamp when claimed

ALTER TABLE payment_links
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ NULL DEFAULT NULL;
