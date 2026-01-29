import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import { addComment, deleteComment ,addNewPost, bookmarkPost, deletePost, dislikePost, getAllPost, getCommentsOfPost, getUserPost, likePost } from "../controllers/post.controller.js";
import { listReviewQueue, reviewComment } from "../controllers/adminModeration.controller.js";


const router = express.Router();

router.route("/addpost").post(isAuthenticated, upload.single('image'), addNewPost);
router.route("/all").get(isAuthenticated,getAllPost);
router.route("/userpost/all").get(isAuthenticated, getUserPost);
router.route("/:id/like").get(isAuthenticated, likePost);
router.route("/:id/dislike").get(isAuthenticated, dislikePost);
router.route("/:id/comment").post(isAuthenticated, addComment); 
router.route("/:id/comment/all").get(isAuthenticated, getCommentsOfPost);
router.route("/delete/:id").delete(isAuthenticated, deletePost);
router.route("/:id/bookmark").get(isAuthenticated, bookmarkPost);
router.delete("/comment/:commentId", isAuthenticated, deleteComment);
router.get("/admin/comments/review-queue", isAuthenticated, listReviewQueue);
router.patch("/admin/comments/:commentId/review", isAuthenticated, reviewComment);



export default router;
