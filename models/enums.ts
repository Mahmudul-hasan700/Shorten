export enum UserProvider {
    Email = "email",
    Google = "google",
    GitHub = "github",
    Twitter = "twitter",
  }
  
  export enum UserRole {
    User = "user",
    Moderator = "moderator",
    Admin = "admin",
    SuperAdmin = "super_admin",
  }
  
  export enum SubscriptionPlan {
    Free = "free",
    Starter = "starter",
    Pro = "pro",
    Enterprise = "enterprise",
  }
  
  export enum SubscriptionStatus {
    Active = "active",
    Inactive = "inactive",
    Cancelled = "cancelled",
    Expired = "expired",
  }
  
  export enum URLStatus {
    Active = "active",
    Inactive = "inactive",
    Expired = "expired",
    Flagged = "flagged",
    Archived = "archived",
  }
  
  export enum DeviceType {
    Desktop = "desktop",
    Mobile = "mobile",
    Tablet = "tablet",
    Other = "other",
  }
  
  export enum CampaignStatus {
    Draft = "draft",
    Active = "active",
    Paused = "paused",
    Completed = "completed",
    Archived = "archived",
  }
  
  export enum Timeframe {
    Hourly = "hourly",
    Daily = "daily",
    Weekly = "weekly",
    Monthly = "monthly",
    Yearly = "yearly",
  }
  
  export enum MFAType {
    TOTP = "totp",
    SMS = "sms",
    Email = "email",
    BackupCode = "backup_code",
  }
  
  export enum BillingInterval {
    Monthly = "monthly",
    Yearly = "yearly",
    Quarterly = "quarterly",
  }
  
  export enum URLProtectionType {
    None = "none",
    Captcha = "captcha",
    Password = "password",
    IPRestricted = "ip_restricted",
  }
  
  export enum ReferralStatus {
    Pending = "pending",
    Completed = "completed",
    Rejected = "rejected",
  }