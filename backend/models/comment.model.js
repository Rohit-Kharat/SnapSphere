import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // ✅ FIX: ref should be Post
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },

    // moderation
    status: {
      type: String,
      enum: ["pending", "approved", "flagged", "rejected", "shadow"],
      default: "pending",
      index: true,
    },

    moderation: {
      decision: { type: String, enum: ["allow", "queue", "reject", "shadow"], default: "queue" },
      reason: { type: String, default: "" },

      heuristicScore: { type: Number, default: 0 },
      heuristicReasons: { type: [String], default: [] },

      // OpenAI moderation snapshot
      aiProvider: { type: String, default: "openai" },
      aiModel: { type: String, default: "omni-moderation-latest" },
      aiFlagged: { type: Boolean, default: false },
      aiCategories: { type: Object, default: {} },
      aiScores: { type: Object, default: {} },

      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reviewedAt: { type: Date },
      reviewNote: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export const Comment = mongoose.model("Comment", commentSchema);
