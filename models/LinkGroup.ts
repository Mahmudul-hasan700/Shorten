import mongoose from "mongoose";

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
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.LinkGroup ||
  mongoose.model("LinkGroup", linkGroupSchema);
