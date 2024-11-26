// models/Click.ts
import mongoose from "mongoose";

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
    country_name: String,
    city: String,
    region: String,
    latitude: Number,
    longitude: Number
  },
  customParams: mongoose.Schema.Types.Mixed
});

clickSchema.index({ url: 1, timestamp: -1 });
clickSchema.index({ timestamp: -1 });
clickSchema.methods.anonymize = async function() {
  this.ip = this.ip.split('.').slice(0, 3).join('.') + '.0';
  this.location.latitude = Math.round(this.location.latitude);
  this.location.longitude = Math.round(this.location.longitude);
  await this.save();
};

export default mongoose.models.Click ||
  mongoose.model("Click", clickSchema);
