import sharp from "sharp";
import mongoose from "mongoose";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { runHeuristics } from "../services/moderation/heuristics.js";
import { runHuggingFaceModeration  } from "../services/moderation/huggingfaceModeration.js";
import { decideModeration } from "../services/moderation/decide.js";


export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;

        if (!image) return res.status(400).json({ message: 'Image required' });

        // image upload 
        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

        // buffer to data uri
        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUri);
        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: authorId
        });
        const user = await User.findById(authorId);
        if (user) {
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({ path: 'author', select: '-password' });

        return res.status(201).json({
            message: 'New post added',
            post,
            success: true,
        })

    } catch (error) {
        console.log(error);
    }
}
export const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture' })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            });
        return res.status(200).json({
            posts,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
};
export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 }).populate({
            path: 'author',
            select: 'username, profilePicture'
        }).populate({
            path: 'comments',
            sort: { createdAt: -1 },
            populate: {
                path: 'author',
                select: 'username, profilePicture'
            }
        });
        return res.status(200).json({
            posts,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const likePost = async (req, res) => {
    try {
        const likeKrneWalaUserKiId = req.id;
        const postId = req.params.id; 
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        // like logic started
        await post.updateOne({ $addToSet: { likes: likeKrneWalaUserKiId } });
        await post.save();

        // implement socket io for real time notification
        const user = await User.findById(likeKrneWalaUserKiId).select('username profilePicture');
         
        const postOwnerId = post.author.toString();
        if(postOwnerId !== likeKrneWalaUserKiId){
            // emit a notification event
            const notification = {
                type:'like',
                userId:likeKrneWalaUserKiId,
                userDetails:user,
                postId,
                message:'Your post was liked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);

console.log("postOwnerId:", postOwnerId, "postOwnerSocketId:", postOwnerSocketId);

if (postOwnerSocketId) {
  io.to(postOwnerSocketId).emit("notification", notification);
} else {
  console.log("User is offline OR not connected to socket:", postOwnerId);
}
        }

        return res.status(200).json({message:'Post liked', success:true});
    } catch (error) {

    }
}
export const dislikePost = async (req, res) => {
    try {
        const likeKrneWalaUserKiId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        // like logic started
        await post.updateOne({ $pull: { likes: likeKrneWalaUserKiId } });
        await post.save();

        // implement socket io for real time notification
        const user = await User.findById(likeKrneWalaUserKiId).select('username profilePicture');
        const postOwnerId = post.author.toString();
        if(postOwnerId !== likeKrneWalaUserKiId){
            // emit a notification event
            const notification = {
                type:'dislike',
                userId:likeKrneWalaUserKiId,
                userDetails:user,
                postId,
                message:'Your post was liked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);

console.log("postOwnerId:", postOwnerId, "postOwnerSocketId:", postOwnerSocketId);

if (postOwnerSocketId) {
  io.to(postOwnerSocketId).emit("notification", notification);
} else {
  console.log("User is offline OR not connected to socket:", postOwnerId);
}
        }



        return res.status(200).json({message:'Post disliked', success:true});
    } catch (error) {

    }
}
export const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const commentKrneWalaUserKiId = req.id;
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "text is required", success: false });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found", success: false });

    // 1) create comment as pending
    const comment = await Comment.create({
      text: text.trim(),
      author: commentKrneWalaUserKiId,
      post: postId,
      status: "pending",
      moderation: { decision: "queue" },
    });

    // 2) heuristics
    const h = runHeuristics(comment.text);

    // 3) AI moderation (only if key exists)
   let ai = {
  aiProvider: "huggingface",
  aiModel: process.env.HF_TOXIC_MODEL || "unitary/toxic-bert",
  aiFlagged: false,
  aiCategories: {},
  aiScores: {},
};

if (process.env.HF_API_TOKEN) {
  ai = await runHuggingFaceModeration(comment.text);
}


    // 4) decide
    const decision = decideModeration({
      heuristicScore: h.heuristicScore,
      heuristicReasons: h.heuristicReasons,
      aiFlagged: ai.aiFlagged,
      aiScores: ai.aiScores,
    });

    // 5) update comment
    comment.status = decision.status;
    comment.moderation = {
      ...comment.moderation,
      decision: decision.decision,
      reason: decision.reason,
      heuristicScore: h.heuristicScore,
      heuristicReasons: h.heuristicReasons,
      aiProvider: ai.aiProvider,
      aiModel: ai.aiModel,
      aiFlagged: ai.aiFlagged,
      aiCategories: ai.aiCategories,
      aiScores: ai.aiScores,
    };
    await comment.save();

    // ✅ IMPORTANT:
    // Push into Post.comments only if approved (so your getAllPost populate stays clean)
    if (comment.status === "approved") {
      post.comments.push(comment._id);
      await post.save();
    }

    await comment.populate({ path: "author", select: "username profilePicture" });
console.log("AI MODERATION RESULT:", {
  provider: ai.aiProvider,
  flagged: ai.aiFlagged,
  scores: ai.aiScores,
});

    return res.status(201).json({
      message: "Comment processed",
      comment,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
export const getCommentsOfPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.id;

    const comments = await Comment.find({
      post: new mongoose.Types.ObjectId(postId),
      $or: [
        { status: "approved" },
        { author: new mongoose.Types.ObjectId(userId) }, // author can see own hidden
      ],
    })
      .sort({ createdAt: 1 })
      .populate("author", "username profilePicture");

    return res.status(200).json({ success: true, comments });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
export const deletePost = async (req,res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'Post not found', success:false});

        // check if the logged-in user is the owner of the post
        if(post.author.toString() !== authorId) return res.status(403).json({message:'Unauthorized'});

        // delete post
        await Post.findByIdAndDelete(postId);

        // remove the post id from the user's post
        let user = await User.findById(authorId);
        user.posts = user.posts.filter(id => id.toString() !== postId);
        await user.save();

        // delete associated comments
        await Comment.deleteMany({post:postId});

        return res.status(200).json({
            success:true,
            message:'Post deleted'
        })

    } catch (error) {
        console.log(error);
    }
}
export const bookmarkPost = async (req,res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'Post not found', success:false});
        
        const user = await User.findById(authorId);
        if(user.bookmarks.includes(post._id)){
            // already bookmarked -> remove from the bookmark
            await user.updateOne({$pull:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({type:'unsaved', message:'Post removed from bookmark', success:true});

        }else{
            // bookmark krna pdega
            await user.updateOne({$addToSet:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({type:'saved', message:'Post bookmarked', success:true});
        }

    } catch (error) {
        console.log(error);
    }
}
// controllers/post.controller.js
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.id;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

    if (String(comment.author) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    await Post.findByIdAndUpdate(comment.post, { $pull: { comments: comment._id } });
    await Comment.findByIdAndDelete(commentId);

    return res.json({ success: true, message: "Comment deleted" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

