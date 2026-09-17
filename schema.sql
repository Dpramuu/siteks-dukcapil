-- ==========================================
-- SITEKS DUKCAPIL - MYSQL DATABASE SCHEMA
-- ==========================================
-- Database : simanten-new
-- DBMS     : MySQL
-- Digunakan melalui Laragon / phpMyAdmin
-- ==========================================

CREATE DATABASE IF NOT EXISTS `simanten-new`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `simanten-new`;

-- ==========================================
-- TABLE: users
-- ==========================================

CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) NOT NULL,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY users_email_unique (email)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- TABLE: templates
-- ==========================================

CREATE TABLE IF NOT EXISTS templates (
    id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    platform ENUM(
        'Instagram',
        'TikTok',
        'Twitter'
    ) NOT NULL DEFAULT 'Instagram',

    PRIMARY KEY (id),

    CONSTRAINT templates_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- TABLE: schedules
-- ==========================================

CREATE TABLE IF NOT EXISTS schedules (
    id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    template_id CHAR(36) NULL,

    title VARCHAR(255) NOT NULL,
    caption TEXT NULL,

    status ENUM(
        'draft',
        'scheduled',
        'published'
    ) DEFAULT 'draft',

    scheduled_for DATETIME NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT schedules_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT schedules_template_id_fkey
        FOREIGN KEY (template_id)
        REFERENCES templates(id)
        ON DELETE SET NULL

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- TABLE: schedule_platforms
-- ==========================================

CREATE TABLE IF NOT EXISTS schedule_platforms (
    id CHAR(36) NOT NULL,
    schedule_id CHAR(36) NOT NULL,

    platform ENUM(
        'Instagram',
        'TikTok',
        'Twitter'
    ) NOT NULL,

    is_uploaded BOOLEAN NOT NULL DEFAULT FALSE,
    uploaded_at DATETIME NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT schedule_platforms_schedule_id_fkey
        FOREIGN KEY (schedule_id)
        REFERENCES schedules(id)
        ON DELETE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- SELESAI
-- ==========================================