import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
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
      required: true,
      minlength: 8
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: 50
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 50
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

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate API key
userSchema.methods.generateApiKey = function () {
  const apiKey = crypto.randomBytes(32).toString("hex");
  this.apiKey = apiKey;
  return apiKey;
};

// Method to update usage stats
userSchema.methods.updateUsageStats = async function (clicks) {
  this.usageStats.totalClicks += clicks;
  if (this.usageStats.remainingQuota > 0) {
    this.usageStats.remainingQuota = Math.max(
      0,
      this.usageStats.remainingQuota - clicks
    );
  }
  await this.save();
};

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
