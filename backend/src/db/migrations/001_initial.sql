-- Migration 001: Create payment_links table
-- Sender-entered 6-digit PIN is hashed (SHA-256 with token as salt) and stored as pin_hash.
-- Plain PIN is never persisted.

CREATE TABLE IF NOT EXISTS payment_links (
  id           SERIAL PRIMARY KEY,
  token        TEXT        NOT NULL UNIQUE,
  pin_hash     TEXT        NOT NULL,
  payment_type TEXT        NOT NULL,
  amount       NUMERIC(12, 2) NOT NULL,
  currency     TEXT        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
