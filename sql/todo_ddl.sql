-- TODO Table DDL for MySQL 8.0
-- Character set: UTF8MB4, Timezone: Asia/Tokyo

CREATE DATABASE IF NOT EXISTS todoapp 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE todoapp;

CREATE TABLE IF NOT EXISTS todo (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    delete_flag BOOLEAN NOT NULL DEFAULT FALSE,
    INDEX idx_created_at (created_at DESC),
    INDEX idx_delete_flag (delete_flag)
) ENGINE=InnoDB 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Set timezone for the session (application will handle this via connection URL)
-- SET time_zone = '+09:00';