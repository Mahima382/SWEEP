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
        'reinstate'
    ) NOT NULL,

    reason TEXT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id),

    FOREIGN KEY (admin_id)
        REFERENCES users(id)
);