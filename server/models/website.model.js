import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["ai", "user"],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const websiteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      default: "Untitled Website",
    },

    latestCode: {
      type: String,
      required: true,
    },

    conversation: [MessageSchema],

    deployed: {
      type: Boolean,
      default: false,
    },

    deployUrl: {
      type: String,
    },

    slug: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true },
);

const Website = mongoose.model("Website", websiteSchema);

export default Website;
