// models/User.ts
import mongoose from "mongoose";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email"
      ]
    },
    password: {
      type: String,
      minlength: 8
    },
    provider: {
      type: String,
      required: true,
      enum: ["email", "google", "github"],
      default: "email"
    },
    avatarUrl: {
      type: String,
      default: null
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    apiKey: {
      type: String,
      unique: true,
      sparse: true
    },
    urls: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Url"
      }
    ],
    usageStats: {
      totalUrls: {
        type: Number,
        default: 0
      },
      totalClicks: {
        type: Number,
        default: 0
      },
      monthlyQuota: {
        type: Number,
        default: 1000
      },
      remainingQuota: {
        type: Number,
        default: 1000
      }
    },
    subscription: {
      plan: {
        type: String,
        enum: ["free", "pro", "enterprise"],
        default: "free"
      },
      startDate: Date,
      endDate: Date,
      status: {
        type: String,
        enum: ["active", "inactive", "cancelled"],
        default: "active"
      }
    },
    lastLogin: Date,
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Method to generate API key
userSchema.methods.generateApiKey = function () {
  const apiKey = crypto.randomBytes(32).toString("hex");
  this.apiKey = apiKey;
  return apiKey;
};

userSchema.index({
  "subscription.status": 1,
  "subscription.endDate": 1
});

userSchema.methods.resetMonthlyQuota = async function () {
  this.usageStats.remainingQuota = this.usageStats.monthlyQuota;
  await this.save();
};

// Method to update usage stats
userSchema.methods.updateUsageStats = async function (
  clicks: number
) {
  this.usageStats.totalClicks += clicks;
  if (this.usageStats.remainingQuota > 0) {
    this.usageStats.remainingQuota = Math.max(
      0,
      this.usageStats.remainingQuota - clicks
    );
  }
  await this.save();
};

const User =
  mongoose.models.User || mongoose.model("User", userSchema);
export default User;
