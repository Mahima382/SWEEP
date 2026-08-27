-- SWEEP MySQL schema — TBD.
-- Data stores from the agreed DFD: D1 Users, D2 Listings, D3 Pickups,
-- D4 Orders, D5 Wallets, D6 Audit Logs, D7 Transactions.
-- Design the tables from FR-01..FR-12 in CLAUDE.md §5 before writing DDL here.
-- Note: no bidding/escrow tables — both are out of scope (locked decision).
CREATE TABLE IF NOT EXISTS pickups (
    id INT AUTO_INCREMENT PRIMARY KEY,

    household_id INT NOT NULL,
    collector_id INT NULL,

    pickup_date DATE NOT NULL,
    pickup_time VARCHAR(50) NOT NULL,

    address VARCHAR(255) NOT NULL,

    waste_type VARCHAR(100) NOT NULL,
    estimated_weight DECIMAL(10,2) NOT NULL,

    actual_weight DECIMAL(10,2) NULL,

    status ENUM(
        'PENDING',
        'ACCEPTED',
        'DECLINED',
        'EN_ROUTE',
        'ARRIVED',
        'COLLECTED',
        'COMPLETED'
    ) NOT NULL DEFAULT 'PENDING',

    decline_reason VARCHAR(255) NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);