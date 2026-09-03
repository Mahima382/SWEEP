-- SWEEP SQLite schema.
-- Data stores from the agreed DFD: D1 Users, D2 Listings, D3 Pickups,
-- D4 Orders, D5 Wallets, D6 Audit Logs, D7 Transactions.
-- Only D1 Users (FR-01/FR-02) is implemented so far; the rest are added
-- alongside the FRs that need them.
-- Note: no bidding/escrow tables — both are out of scope (locked decision).

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT NOT NULL CHECK (role IN ('household', 'collector', 'global', 'company', 'admin')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  mobile TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_kyc', 'suspended', 'banned')),
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT,
  profile_completed INTEGER NOT NULL DEFAULT 0,
  profile_data TEXT,
  reset_token TEXT,
  reset_token_expires TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
