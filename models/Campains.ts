import mongoose from "mongoose";

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
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Campaign ||
  mongoose.model("Campaign", campaignSchema);
