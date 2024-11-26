//models/AnalyticsAggregation.ts
import mongoose from "mongoose";

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

analyticsAggregationSchema.index({
  url: 1,
  timeframe: 1,
  startDate: 1
});
analyticsAggregationSchema.index({ 
  startDate: 1 
}, { 
  expireAfterSeconds: 365 * 24 * 60 * 60  // 1 year
});

export default mongoose.models.AnalyticsAggregation ||
  mongoose.model("AnalyticsAggregation", analyticsAggregationSchema);
