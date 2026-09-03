-- SWEEP MySQL schema — TBD.
-- Data stores from the agreed DFD: D1 Users, D2 Listings, D3 Pickups,
-- D4 Orders, D5 Wallets, D6 Audit Logs, D7 Transactions.
-- Design the tables from FR-01..FR-12 in CLAUDE.md §5 before writing DDL here.
-- Note: no bidding/escrow tables — both are out of scope (locked decision).

-- FR-04 Household wallet (D5 Wallets, D7 Transactions). The live API uses an
-- in-memory ledger until these tables are connected through walletModel.
CREATE TABLE IF NOT EXISTS wallets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id VARCHAR(32) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  type ENUM('earning', 'withdrawal') NOT NULL,
  status ENUM('pending', 'available', 'completed') NOT NULL,
  amount_bdt INT NOT NULL,
  category VARCHAR(32) NULL,
  reference VARCHAR(128) NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_wallet_txn_user (user_id)
);

CREATE TABLE IF NOT EXISTS wallet_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id VARCHAR(32) NOT NULL UNIQUE,
  rating TINYINT NOT NULL,
  comment VARCHAR(280) NULL,
  created_at DATETIME NOT NULL,
  CONSTRAINT fk_wallet_review_txn
    FOREIGN KEY (transaction_id) REFERENCES wallet_transactions(id)
);
