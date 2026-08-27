-- backend/database/notification.sql

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    recipient_id BIGINT NOT NULL,
    type ENUM(
        'Pickup',
        'Order',
        'Payment',
        'Wallet',
        'Subscription',
        'KYC',
        'Security',
        'Fraud',
        'Account',
        'System'
    ) NOT NULL,
    priority ENUM(
        'Normal',
        'Important',
        'Urgent',
        'Critical'
    ) NOT NULL DEFAULT 'Normal',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,

    reference_type VARCHAR(50) NULL,
    reference_id BIGINT NULL,

    action_type VARCHAR(50) NULL,
    action_url VARCHAR(500) NULL,

    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,

    INDEX idx_notification_recipient (recipient_id),
    INDEX idx_notification_unread (recipient_id, is_read),
    INDEX idx_notification_created (recipient_id, created_at),

    CONSTRAINT fk_notification_recipient
        FOREIGN KEY (recipient_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);