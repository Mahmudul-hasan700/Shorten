import mongoose, { Document, Model } from "mongoose";
import { nanoid } from "nanoid";
import axios from "axios";
import * as cheerio from "cheerio";

interface IUrl extends Document {
  originalUrl: string;
  shortCode: string;
  customAlias?: string;
  user: mongoose.Schema.Types.ObjectId;
  domain: string;
  title: string;
  description: string;
  tags: string[];
  status: "active" | "inactive" | "expired" | "flagged";
  expiresAt?: Date;
  password?: string;
  clicks: number;
  lastClickAt?: Date;
  incrementClicks(): Promise<void>;
}

interface IUrlModel extends Model<IUrl> {
  extractMetaTitle(url: string): Promise<string>;
}

const urlSchema = new mongoose.Schema<IUrl>(
  {
    originalUrl: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          const urlPattern = new RegExp(
            "^(https?:\\/\\/)?" + // protocol
              "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
              "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
              "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
              "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
              "(\\#[-a-z\\d_]*)?$",
            "i" // fragment locator
          );
          return urlPattern.test(v);
        },
        message: "Please enter a valid URL"
      }
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      default: () => nanoid(6),
      trim: true
    },
    customAlias: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return v ? /^[a-zA-Z0-9-_]{3,30}$/.test(v) : true;
        },
        message:
          "Custom alias must be 3-30 characters long and contain only alphanumeric characters, hyphens, and underscores"
      }
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
    title: {
      type: String,
      default: ""
    },
    description: {
      type: String,
      default: ""
    },
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

// Static method to extract meta title
urlSchema.statics.extractMetaTitle = async function (
  url: string
): Promise<string> {
  try {
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    const { data: html } = await axios.get(fullUrl);

    const $ = cheerio.load(html);
    return $("title").text().trim() || "";
  } catch (error) {
    console.warn(`Could not extract title for URL: ${url}`, error);
    return "";
  }
};

// Pre-save middleware to extract title if not provided
urlSchema.pre<IUrl>("save", async function (next) {
  if (!this.title && this.originalUrl) {
    try {
      const model = this.constructor as IUrlModel; // Explicitly cast the constructor
      this.title = await model.extractMetaTitle(this.originalUrl);
    } catch (error) {
      console.warn("Title extraction failed", error);
    }
  }
  next();
});

urlSchema.methods.incrementClicks = async function () {
  this.clicks += 1;
  this.lastClickAt = new Date();
  await this.save();
};

const Url =
  (mongoose.models.Url as IUrlModel) ||
  mongoose.model<IUrl, IUrlModel>("Url", urlSchema);

export default Url;
