-- URL Shortener Database Schema

-- Drop existing types and tables if they exist
DROP TYPE IF EXISTS 
    user_provider, user_role, subscription_plan, subscription_status, 
    url_status, device_type, campaign_status, timeframe, 
    mfa_type, billing_interval, url_protection_type CASCADE;

DROP TABLE IF EXISTS 
    users, urls, clicks, campaigns, campaign_urls, analytics_aggregations, 
    api_rate_limits, ip_whitelist, audit_logs, payments, 
    subscription_features, api_logs, webhooks, api_keys, 
    url_conversions, referrals CASCADE;

-- Enum Types
CREATE TYPE user_provider AS ENUM ('email', 'google', 'github', 'microsoft');
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin', 'super_admin');
CREATE TYPE subscription_plan AS ENUM ('free', 'starter', 'pro', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'cancelled', 'expired');
CREATE TYPE url_status AS ENUM ('active', 'inactive', 'expired', 'flagged', 'archived');
CREATE TYPE device_type AS ENUM ('desktop', 'mobile', 'tablet', 'other');
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed', 'archived');
CREATE TYPE timeframe AS ENUM ('hourly', 'daily', 'weekly', 'monthly', 'yearly');
CREATE TYPE mfa_type AS ENUM ('totp', 'sms', 'email', 'backup_code');
CREATE TYPE billing_interval AS ENUM ('monthly', 'yearly', 'quarterly');
CREATE TYPE url_protection_type AS ENUM ('none', 'captcha', 'password', 'ip_restricted');

-- Users Table with Enhanced Features
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    provider user_provider NOT NULL DEFAULT 'email',
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'user',
    
    -- Authentication & Security
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token TEXT,
    reset_password_token TEXT,
    reset_password_expires TIMESTAMP,
    last_password_change TIMESTAMP,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_type mfa_type,
    mfa_secret TEXT,
    mfa_recovery_codes TEXT[],
    
    -- Account Tracking
    signup_ip INET,
    last_ip INET,
    last_login TIMESTAMP,
    account_status TEXT DEFAULT 'active' 
        CHECK (account_status IN ('active', 'suspended', 'deleted')),
    
    -- API & Usage
    api_key TEXT UNIQUE,
    usage_total_urls INTEGER NOT NULL DEFAULT 0,
    usage_total_clicks INTEGER NOT NULL DEFAULT 0,
    usage_monthly_quota INTEGER NOT NULL DEFAULT 1000,
    usage_remaining_quota INTEGER NOT NULL DEFAULT 1000,
    
    -- Subscription Management
    subscription_plan subscription_plan NOT NULL DEFAULT 'free',
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,
    subscription_status subscription_status NOT NULL DEFAULT 'active',
    
    -- Referral System
    referral_code VARCHAR(20) UNIQUE,
    total_referrals INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
    CONSTRAINT password_length CHECK (length(password) >= 8)
);

CREATE INDEX idx_user_email ON users (email);
CREATE INDEX idx_user_subscription ON users (subscription_status, subscription_end_date);
CREATE INDEX idx_user_referral ON users (referral_code);

-- URLs Table with Advanced Features
CREATE TABLE urls (
    id SERIAL PRIMARY KEY,
    original_url TEXT NOT NULL,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    custom_alias VARCHAR(30) UNIQUE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    
    -- URL Metadata
    domain TEXT,
    title TEXT DEFAULT '',
    description TEXT DEFAULT '',
    tags TEXT[],
    
    -- URL Status and Protection
    status url_status NOT NULL DEFAULT 'active',
    protection_type url_protection_type DEFAULT 'none',
    url_password TEXT,
    
    -- Click and Tracking
    clicks INTEGER NOT NULL DEFAULT 0,
    unique_visitors INTEGER NOT NULL DEFAULT 0,
    max_clicks INTEGER,
    is_temporary BOOLEAN DEFAULT FALSE,
    expiration_type VARCHAR(20) DEFAULT 'time',
    expires_at TIMESTAMP,
    
    -- Advanced Features
    qr_code_path TEXT,
    bot_protection_enabled BOOLEAN DEFAULT FALSE,
    conversion_tracking_enabled BOOLEAN DEFAULT FALSE,
    conversion_pixel_url TEXT,
    
    -- Timestamps
    last_click_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_url CHECK (original_url ~* '^https?://'),
    CONSTRAINT custom_alias_format CHECK (
        custom_alias IS NULL OR 
        custom_alias ~* '^[a-z0-9-_]{3,30}$'
    )
);

CREATE INDEX idx_url_user ON urls (user_id);
CREATE INDEX idx_url_short_code ON urls (short_code);
CREATE INDEX idx_url_custom_alias ON urls (custom_alias);

-- Clicks Tracking Table
CREATE TABLE clicks (
    id SERIAL PRIMARY KEY,
    url_id INTEGER NOT NULL REFERENCES urls(id),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Network & Location
    ip INET,
    anonymized_ip TEXT,
    user_agent TEXT,
    referrer TEXT,
    
    -- Device & Browser Details
    device device_type,
    browser TEXT,
    os TEXT,
    
    -- Geolocation
    location_country TEXT,
    location_country_name TEXT,
    location_city TEXT,
    location_region TEXT,
    location_latitude NUMERIC(10, 6),
    location_longitude NUMERIC(10, 6),
    
    -- Advanced Tracking
    event_type TEXT DEFAULT 'click',
    custom_params JSONB
);

CREATE INDEX idx_click_url ON clicks (url_id, timestamp DESC);
CREATE INDEX idx_click_timestamp ON clicks (timestamp DESC);

-- Campaigns Table
CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    
    -- Campaign Timing
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    status campaign_status NOT NULL DEFAULT 'draft',
    
    -- Campaign Metadata
    tags TEXT[],
    description TEXT,
    
    -- Financial Tracking
    budget NUMERIC(10, 2) DEFAULT 0,
    cost_per_click NUMERIC(10, 2) DEFAULT 0,
    total_conversion_value NUMERIC(10, 2) DEFAULT 0,
    conversion_rate NUMERIC(5, 2),
    conversion_goal NUMERIC(10, 2),
    
    -- UTM Parameters
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Campaign URLs Mapping
CREATE TABLE campaign_urls (
    campaign_id INTEGER REFERENCES campaigns(id),
    url_id INTEGER REFERENCES urls(id),
    PRIMARY KEY (campaign_id, url_id)
);

-- Conversion Tracking Table
CREATE TABLE url_conversions (
    id SERIAL PRIMARY KEY,
    url_id INTEGER REFERENCES urls(id),
    conversion_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    conversion_value NUMERIC(10, 2),
    conversion_type TEXT,
    additional_metadata JSONB
);

-- Referral Tracking Table
CREATE TABLE referrals (
    id SERIAL PRIMARY KEY,
    referrer_id INTEGER REFERENCES users(id),
    referred_id INTEGER REFERENCES users(id),
    referral_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending' 
        CHECK (status IN ('pending', 'completed', 'rejected'))
);

-- API Key Management
CREATE TABLE api_keys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    api_key TEXT UNIQUE NOT NULL,
    name VARCHAR(100),
    scopes TEXT[],
    last_used TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Analytics Aggregations Table
CREATE TABLE analytics_aggregations (
    id SERIAL PRIMARY KEY,
    url_id INTEGER REFERENCES urls(id),
    user_id INTEGER REFERENCES users(id),
    campaign_id INTEGER REFERENCES campaigns(id),
    
    -- Timeframe
    timeframe timeframe NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    
    -- Click Metrics
    total_clicks INTEGER NOT NULL DEFAULT 0,
    unique_clicks INTEGER NOT NULL DEFAULT 0,
    
    -- Device Breakdown
    device_desktop INTEGER NOT NULL DEFAULT 0,
    device_mobile INTEGER NOT NULL DEFAULT 0,
    device_tablet INTEGER NOT NULL DEFAULT 0,
    device_other INTEGER NOT NULL DEFAULT 0,
    
    -- Advanced Analytics
    top_countries JSONB,
    top_referrers JSONB,
    browser_breakdown JSONB,
    os_breakdown JSONB,
    platform_breakdown JSONB,
    language_breakdown JSONB
);

CREATE INDEX idx_analytics_url ON analytics_aggregations (url_id, timeframe, start_date);
CREATE INDEX idx_analytics_start_date ON analytics_aggregations (start_date);

-- API Rate Limits
CREATE TABLE api_rate_limits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    endpoint TEXT NOT NULL,
    request_limit INTEGER NOT NULL DEFAULT 1000,
    requests_made INTEGER NOT NULL DEFAULT 0,
    reset_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- IP Whitelist for Enhanced Security
CREATE TABLE ip_whitelist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    ip_address INET NOT NULL
);

-- Audit Logging
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action TEXT NOT NULL,
    table_affected TEXT,
    record_id INTEGER,
    old_value JSONB,
    new_value JSONB,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Payment Tracking
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL,
    transaction_id TEXT UNIQUE,
    payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Subscription Feature Matrix
CREATE TABLE subscription_features (
    id SERIAL PRIMARY KEY,
    subscription_plan subscription_plan NOT NULL,
    feature_name TEXT NOT NULL,
    feature_limit INTEGER DEFAULT NULL,
    billing_interval billing_interval DEFAULT 'monthly',
    price NUMERIC(10, 2),
    trial_days INTEGER DEFAULT 0,
    feature_description TEXT
);

-- API Logging
CREATE TABLE api_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    request_body JSONB,
    response_body JSONB,
    status_code INTEGER,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Webhooks for Integrations
CREATE TABLE webhooks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    url TEXT NOT NULL,
    event TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);
