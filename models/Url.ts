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
  clicks: number;
  expiresAt?: Date;
  lastClickAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  incrementClicks(): Promise<void>;
}

interface IUrlModel extends Model<IUrl> {
  extractMetaData(
    url: string
  ): Promise<{ title: string; description: string }>;
  generateUniqueShortCode(): Promise<string>;
}

const urlSchema = new mongoose.Schema<IUrl>(
  {
    originalUrl: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          try {
            new URL(v);
            return true;
          } catch {
            return false;
          }
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
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v?: string) {
          return v ? /^[a-z0-9-_]{3,30}$/.test(v) : true;
        },
        message:
          "Custom alias must be 3-30 characters long and contain only lowercase alphanumeric characters, hyphens, and underscores"
      }
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    domain: {
      type: String,
      default: function () {
        try {
          return new URL(this.originalUrl).hostname;
        } catch {
          return "unknown";
        }
      }
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
    clicks: {
      type: Number,
      default: 0
    },
    expiresAt: Date,
    lastClickAt: Date
  },
  {
    timestamps: true
  }
);

// Static method to extract meta data
urlSchema.statics.extractMetaData = async function (
  url: string
): Promise<{ title: string; description: string }> {
  try {
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    const { data: html } = await axios.get(fullUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      },
      timeout: 5000
    });

    const $ = cheerio.load(html);
    const title = $("title").text().trim() || "";
    const description =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      "";

    return { title, description };
  } catch (error) {
    console.warn(`Could not extract metadata for URL: ${url}`, error);
    return { title: "", description: "" };
  }
};

// Static method to generate a unique short code
urlSchema.statics.generateUniqueShortCode = async function () {
  let shortCode: string = nanoid(6);
  let isUnique = false;

  while (!isUnique) {
    const existingUrl = await this.findOne({ shortCode });

    if (!existingUrl) {
      isUnique = true;
    }
  }

  return shortCode;
};

// Method to increment clicks
urlSchema.methods.incrementClicks = async function () {
  this.clicks += 1;
  this.lastClickAt = new Date();
  await this.save();
};

// Pre-save middleware to extract metadata if not provided
urlSchema.pre<IUrl>("save", async function (next) {
  if ((!this.title || !this.description) && this.originalUrl) {
    try {
      const model = this.constructor as IUrlModel;
      const { title, description } = await model.extractMetaData(
        this.originalUrl
      );

      if (!this.title) this.title = title;
      if (!this.description) this.description = description;
    } catch (error) {
      console.warn("Metadata extraction failed", error);
    }
  }
  next();
});

const Url =
  (mongoose.models.Url as IUrlModel) ||
  mongoose.model<IUrl, IUrlModel>("Url", urlSchema);

export default Url;
