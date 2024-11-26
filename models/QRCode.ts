// models/QRCode.ts
import mongoose from "mongoose";

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
    foregroundColor: {
      type: String,
      validate: {
        validator: function(v) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: "Invalid color format"
      }
    },
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

export default mongoose.models.QRCode ||
  mongoose.model("QRCode", qrCodeSchema);
