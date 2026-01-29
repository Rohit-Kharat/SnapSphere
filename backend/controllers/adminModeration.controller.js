import { Comment } from "../models/comment.model.js";

export const listReviewQueue = async (req, res) => {
  try {
    const items = await Comment.find({ status: { $in: ["pending", "flagged"] } })
      .sort({ createdAt: -1 })
      .limit(200)
      .populate("author", "username profilePicture")
      .populate("post", "caption image");

    return res.json({ success: true, items });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const reviewComment = async (req, res) => {
  try {
    const adminId = req.id;
    const { commentId } = req.params;
    const { action, note } = req.body; // approve | reject | shadow

    const map = {
      approve: { status: "approved", decision: "allow" },
      reject: { status: "rejected", decision: "reject" },
      shadow: { status: "shadow", decision: "shadow" },
    };

    if (!map[action]) {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

    comment.status = map[action].status;
    comment.moderation.decision = map[action].decision;
    comment.moderation.reviewedBy = adminId;
    comment.moderation.reviewedAt = new Date();
    comment.moderation.reviewNote = note || "";

    await comment.save();

    return res.json({ success: true, comment });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
