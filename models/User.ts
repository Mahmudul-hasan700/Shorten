

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Enum Constants
const USER_PROVIDERS = ['email', 'google', 'github', 'microsoft'];
const USER_ROLES = ['user', 'moderator', 'admin', 'super_admin'];
const SUBSCRIPTION_PLANS = ['free', 'starter', 'pro', 'enterprise'];
const SUBSCRIPTION_STATUSES = ['active', 'inactive', 'cancelled', 'expired'];
const URL_STATUSES = ['active', 'inactive', 'expired', 'flagged', 'archived'];
const DEVICE_TYPES = ['desktop', 'mobile', 'tablet', 'other'];
const CAMPAIGN_STATUSES = ['draft', 'active', 'paused', 'completed', 'archived'];
const TIMEFRAMES = ['hourly', 'daily', 'weekly', 'monthly', 'yearly'];
const MFA_TYPES = ['totp', 'sms', 'email', 'backup_code'];
const BILLING_INTERVALS = ['monthly', 'yearly', 'quarterly'];
const URL_PROTECTION_TYPES = ['none', 'captcha', 'password', 'ip_restricted'];
const REFERRAL_STATUSES = ['pending', 'completed', 'rejected'];

// User Model
const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        maxlength: 100
    },
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/, 'Invalid email format']
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },

    // Authentication Fields
    provider: {
        type: String,
        enum: USER_PROVIDERS,
        default: 'email'
    },
    role: {
        type: String,
        enum: USER_ROLES,
        default: 'user'
    },
    avatar_url: String,

    // Security & Verification
    is_verified: {
        type: Boolean,
        default: false
    },
    verification_token: String,
    reset_password_token: String,
    reset_password_expires: Date,
    last_password_change: Date,

    // Multi-Factor Authentication
    two_factor_enabled: {
        type: Boolean,
        default: false
    },
    mfa_type: {
        type: String,
        enum: MFA_TYPES
    },
    mfa_secret: String,
    mfa_recovery_codes: [String],

    // Account Tracking
    signup_ip: String,
    last_ip: String,
    last_login: Date,
    account_status: {
        type: String,
        enum: ['active', 'suspended', 'deleted'],
        default: 'active'
    },

    // Usage & API
    api_key: {
        type: String,
        unique: true
    },
    usage_stats: {
        total_urls: {
            type: Number,
            default: 0
        },
        total_clicks: {
            type: Number,
            default: 0
        },
        monthly_quota: {
            type: Number,
            default: 1000
        },
        remaining_quota: {
            type: Number,
            default: 1000
        }
    },

    // Subscription Management
    subscription: {
        plan: {
            type: String,
            enum: SUBSCRIPTION_PLANS,
            default: 'free'
        },
        start_date: Date,
        end_date: Date,
        status: {
            type: String,
            enum: SUBSCRIPTION_STATUSES,
            default: 'active'
        }
    },

    // Referral System
    referral_code: {
        type: String,
        unique: true
    },
    total_referrals: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    indexes: [
        { email: 1 },
        { referral_code: 1 },
        { 'subscription.status': 1, 'subscription.end_date': 1 }
    ]
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
