// models/QRCode.ts
import mongoose, { Document, Model, Schema } from "mongoose";

// Interface for the QR Code schema
interface QRCodeStyle {
  foregroundColor?: string;
  backgroundColor?: string;
  logoUrl?: string;
  cornerStyle?: string;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
}

export interface QRCodeDocument extends Document {
  url: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  style?: QRCodeStyle;
  size?: number;
  downloadCount: number;
  createdAt: Date;
}

const qrCodeStyleSchema = new Schema<QRCodeStyle>({
  foregroundColor: {
    type: String,
    validate: {
      validator: (v: string) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v),
      message: "Invalid color format",
    },
  },
  backgroundColor: { type: String },
  logoUrl: { type: String },
  cornerStyle: { type: String },
  errorCorrectionLevel: {
    type: String,
    enum: ["L", "M", "Q", "H"],
    default: "M",
  },
});

const qrCodeSchema = new Schema<QRCodeDocument>({
  url: {
    type: Schema.Types.ObjectId,
    ref: "Url",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  style: qrCodeStyleSchema,
  size: { type: Number },
  downloadCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Export the QRCode model
const QRCode: Model<QRCodeDocument> =
  mongoose.models.QRCode || mongoose.model<QRCodeDocument>("QRCode", qrCodeSchema);

export default QRCode;