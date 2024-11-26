// models/Url.ts
import mongoose from "mongoose";
import { nanoid } from "nanoid";

const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(
            v
          );
        },
        message: "Please enter a valid URL"
      }
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: () => nanoid(6)
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
    lastClickAt: Date
  },
  {
    timestamps: true
  }
);

urlSchema.methods.incrementClicks = async function () {
  this.clicks += 1;
  this.lastClickAt = new Date();
  await this.save();
};

urlSchema.index({ shortCode: 1 });
urlSchema.index({ customAlias: 1 });
urlSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.Url ||
  mongoose.model("Url", urlSchema);
