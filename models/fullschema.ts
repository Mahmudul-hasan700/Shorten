import mongoose from "mongoose";

// URL Model
const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
      trim: true
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    customAlias: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    domain: {
      type: String,
      default: "default"
    },
    title: String,
    description: String,
    tags: [String],
    status: {
      type: String,
      enum: ["active", "inactive", "expired", "flagged"],
      default: "active"
    },
    expiresAt: Date,
    password: {
      type: String,
      select: false
    },
    clicks: {
      type: Number,
      default: 0
    },
    lastClickAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: Date
  },
  {
    timestamps: true
  }
);

// Click Analytics Model
const clickSchema = new mongoose.Schema({
  url: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Url",
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ip: String,
  userAgent: String,
  device: {
    type: String,
    enum: ["desktop", "mobile", "tablet", "other"]
  },
  browser: String,
  os: String,
  referrer: String,
  location: {
    country: String,
    city: String,
    region: String,
    latitude: Number,
    longitude: Number
  },
  customParams: mongoose.Schema.Types.Mixed
});

// Campaign Model
const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    urls: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Url"
      }
    ],
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ["draft", "active", "paused", "completed"],
      default: "draft"
    },
    tags: [String],
    description: String,
    utmParams: {
      source: String,
      medium: String,
      campaign: String,
      term: String,
      content: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: Date
  },
  {
    timestamps: true
  }
);

// Analytics Aggregation Model
const analyticsAggregationSchema = new mongoose.Schema({
  url: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Url"
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campaign"
  },
  timeframe: {
    type: String,
    enum: ["hourly", "daily", "weekly", "monthly"],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  metrics: {
    totalClicks: {
      type: Number,
      default: 0
    },
    uniqueClicks: {
      type: Number,
      default: 0
    },
    deviceBreakdown: {
      desktop: { type: Number, default: 0 },
      mobile: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    topCountries: [
      {
        country: String,
        clicks: Number
      }
    ],
    topReferrers: [
      {
        referrer: String,
        clicks: Number
      }
    ],
    browserBreakdown: mongoose.Schema.Types.Mixed,
    osBreakdown: mongoose.Schema.Types.Mixed
  }
});

// QR Code Model
const qrCodeSchema = new mongoose.Schema({
  url: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Url",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  style: {
    foregroundColor: String,
    backgroundColor: String,
    logoUrl: String,
    cornerStyle: String,
    errorCorrectionLevel: {
      type: String,
      enum: ["L", "M", "Q", "H"],
      default: "M"
    }
  },
  size: Number,
  downloadCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Link Group Model
const linkGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    urls: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Url"
      }
    ],
    description: String,
    isPublic: {
      type: Boolean,
      default: false
    },
    customSlug: {
      type: String,
      unique: true,
      sparse: true
    },
    theme: {
      backgroundColor: String,
      textColor: String,
      fontFamily: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: Date
  },
  {
    timestamps: true
  }
);

const geneateShortCode = () => {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let shortCode = "";
  for (let i = 0; i < 6; i++) {
    shortCode += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }
  return shortCode;
};

// Model methods and middleware
urlSchema.pre("save", function (next) {
  if (!this.shortCode) {
    this.shortCode = geneateShortCode();
  }
  next();
});

urlSchema.methods.incrementClicks = async function () {
  this.clicks += 1;
  this.lastClickAt = new Date();
  await this.save();
};

clickSchema.index({ url: 1, timestamp: -1 });
clickSchema.index({ timestamp: -1 });

analyticsAggregationSchema.index({
  url: 1,
  timeframe: 1,
  startDate: 1
});

// Export models
const Url = mongoose.model("Url", urlSchema);
const Click = mongoose.model("Click", clickSchema);
const Campaign = mongoose.model("Campaign", campaignSchema);
const AnalyticsAggregation = mongoose.model(
  "AnalyticsAggregation",
  analyticsAggregationSchema
);
const QRCode = mongoose.model("QRCode", qrCodeSchema);
const LinkGroup = mongoose.model("LinkGroup", linkGroupSchema);

module.exports = {
  Url,
  Click,
  Campaign,
  AnalyticsAggregation,
  QRCode,
  LinkGroup
};
