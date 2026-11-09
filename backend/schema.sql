-- db name: sweep
CREATE DATABASE IF NOT EXISTS sweep;

USE sweep;



-- users table (user info)


CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    phone VARCHAR(20) NOT NULL UNIQUE,

    nid VARCHAR(50) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    role ENUM(
        'household',
        'local_collector',
        'global_collector',
        'company',
        'admin'
    ) NOT NULL,

    status ENUM(
        'active',
        'suspended',
        'banned'
    ) NOT NULL DEFAULT 'active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);



-- admin action table (history of ban/suspension/stuff done by admin))

CREATE TABLE IF NOT EXISTS user_admin_actions (
    id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,

    admin_id INT NOT NULL,

    action ENUM(
        'suspend',
        'ban',
        'reinstate',
        'kyc_approve',
        'kyc_reject'
    ) NOT NULL,

    reason TEXT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id),

    FOREIGN KEY (admin_id)
        REFERENCES users(id)
);

-- kyc submissions table (application and review information)

CREATE TABLE IF NOT EXISTS kyc_submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,

    status ENUM(
        'pending',
        'approved',
        'rejected'
    ) NOT NULL DEFAULT 'pending',

    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    reviewed_by INT NULL,

    reviewed_at TIMESTAMP NULL,

    decision_reason TEXT NULL,

    FOREIGN KEY (user_id)
        REFERENCES users(id),

    FOREIGN KEY (reviewed_by)
        REFERENCES users(id)
);

-- kyc documents table (uploaded document information)

CREATE TABLE IF NOT EXISTS kyc_documents (
    id INT PRIMARY KEY AUTO_INCREMENT,

    submission_id INT NOT NULL,

    document_type VARCHAR(50) NOT NULL,

    file_path VARCHAR(500) NOT NULL,

    original_filename VARCHAR(255) NOT NULL,

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (submission_id)
        REFERENCES kyc_submissions(id)
);