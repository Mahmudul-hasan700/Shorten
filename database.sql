-- URL Shortener Professional Database Schema

-- Enum Types
CREATE TYPE user_provider AS ENUM ('email', 'google', 'github');
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'cancelled');
CREATE TYPE url_status AS ENUM ('active', 'inactive', 'expired', 'flagged');
CREATE TYPE device_type AS ENUM ('desktop', 'mobile', 'tablet', 'other');
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed');
CREATE TYPE timeframe AS ENUM ('hourly', 'daily', 'weekly', 'monthly');

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    provider user_provider NOT NULL DEFAULT 'email',
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'user',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token TEXT,
    reset_password_token TEXT,
    reset_password_expires TIMESTAMP,
    api_key TEXT UNIQUE,
    
    usage_total_urls INTEGER NOT NULL DEFAULT 0,
    usage_total_clicks INTEGER NOT NULL DEFAULT 0,
    usage_monthly_quota INTEGER NOT NULL DEFAULT 1000,
    usage_remaining_quota INTEGER NOT NULL DEFAULT 1000,
    
    subscription_plan subscription_plan NOT NULL DEFAULT 'free',
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,
    subscription_status subscription_status NOT NULL DEFAULT 'active',
    
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
    CONSTRAINT password_length CHECK (length(password) >= 8)
);

-- User Indexes
CREATE INDEX idx_user_email ON users (email);
CREATE INDEX idx_user_username ON users (username);
CREATE INDEX idx_user_api_key ON users (api_key);
CREATE INDEX idx_user_subscription ON users (subscription_status, subscription_end_date);

-- URLs Table
CREATE TABLE urls (
    id SERIAL PRIMARY KEY,
    original_url TEXT NOT NULL,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    custom_alias VARCHAR(30) UNIQUE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    domain TEXT,
    title TEXT DEFAULT '',
    description TEXT DEFAULT '',
    tags TEXT[],
    status url_status NOT NULL DEFAULT 'active',
    clicks INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMP,
    last_click_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_url CHECK (original_url ~* '^https?://'),
    CONSTRAINT custom_alias_format CHECK (
        custom_alias IS NULL OR 
        custom_alias ~* '^[a-z0-9-_]{3,30}$'
    )
);

-- URL Indexes
CREATE INDEX idx_url_user ON urls (user_id);
CREATE INDEX idx_url_short_code ON urls (short_code);
CREATE INDEX idx_url_custom_alias ON urls (custom_alias);
CREATE INDEX idx_url_status ON urls (status);
CREATE INDEX idx_url_clicks ON urls (clicks DESC);

-- Clicks Table
CREATE TABLE clicks (
    id SERIAL PRIMARY KEY,
    url_id INTEGER NOT NULL REFERENCES urls(id),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip INET,
    user_agent TEXT,
    device device_type,
    browser TEXT,
    os TEXT,
    referrer TEXT,
    location_country TEXT,
    location_country_name TEXT,
    location_city TEXT,
    location_region TEXT,
    location_latitude NUMERIC(10, 6),
    location_longitude NUMERIC(10, 6),
    custom_params JSONB
);

-- Clicks Indexes
CREATE INDEX idx_click_url ON clicks (url_id, timestamp DESC);
CREATE INDEX idx_click_timestamp ON clicks (timestamp DESC);
CREATE INDEX idx_click_device ON clicks (device);
CREATE INDEX idx_click_location ON clicks (location_country, location_city);

-- Campaigns Table
CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    status campaign_status NOT NULL DEFAULT 'draft',
    tags TEXT[],
    description TEXT,

    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Campaign Indexes
CREATE INDEX idx_campaign_user ON campaigns (user_id);
CREATE INDEX idx_campaign_status ON campaigns (status);
CREATE INDEX idx_campaign_dates ON campaigns (start_date, end_date);

-- Campaign URLs Linking Table
CREATE TABLE campaign_urls (
    campaign_id INTEGER REFERENCES campaigns(id),
    url_id INTEGER REFERENCES urls(id),
    PRIMARY KEY (campaign_id, url_id)
);

-- Analytics Aggregations Table
CREATE TABLE analytics_aggregations (
    id SERIAL PRIMARY KEY,
    url_id INTEGER REFERENCES urls(id),
    user_id INTEGER REFERENCES users(id),
    campaign_id INTEGER REFERENCES campaigns(id),
    timeframe timeframe NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,

    total_clicks INTEGER NOT NULL DEFAULT 0,
    unique_clicks INTEGER NOT NULL DEFAULT 0,

    device_desktop INTEGER NOT NULL DEFAULT 0,
    device_mobile INTEGER NOT NULL DEFAULT 0,
    device_tablet INTEGER NOT NULL DEFAULT 0,
    device_other INTEGER NOT NULL DEFAULT 0,

    top_countries JSONB,
    top_referrers JSONB,
    browser_breakdown JSONB,
    os_breakdown JSONB
);

-- Analytics Indexes
CREATE INDEX idx_analytics_url ON analytics_aggregations (url_id, timeframe, start_date);
CREATE INDEX idx_analytics_start_date ON analytics_aggregations (start_date);

-- API Usage Logs Table
CREATE TABLE api_usage_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    endpoint TEXT NOT NULL,
    request_method VARCHAR(10),
    request_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    response_status INTEGER,
    request_params JSONB,
    execution_time_ms INTEGER
);

-- API Usage Indexes
CREATE INDEX idx_api_usage_user ON api_usage_logs (user_id);
CREATE INDEX idx_api_usage_timestamp ON api_usage_logs (request_timestamp DESC);
CREATE INDEX idx_api_usage_endpoint ON api_usage_logs (endpoint);

-- Rate Limits Table
CREATE TABLE rate_limits (
    user_id INTEGER REFERENCES users(id),
    endpoint TEXT NOT NULL,
    time_window TIMESTAMP NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (user_id, endpoint, time_window)
);

-- URL Safety Checks Table
CREATE TABLE url_safety_checks (
    url_id INTEGER REFERENCES urls(id),
    checked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_safe BOOLEAN NOT NULL,
    safety_provider TEXT,
    malware_details JSONB,
    phishing_risk NUMERIC(5,2)
);

-- Webhooks Table
CREATE TABLE webhooks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    event_type TEXT NOT NULL,
    endpoint_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    secret_token TEXT
);

-- Webhook Indexes
CREATE INDEX idx_webhook_user ON webhooks (user_id);
CREATE INDEX idx_webhook_event ON webhooks (event_type);
