import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Bookmark, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { Button } from "./ui/button";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from "./CommentDialog";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { Badge } from "./ui/badge";
import { Link } from "react-router-dom";

const Post = ({ post }) => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
  const [postLike, setPostLike] = useState(post.likes.length);
  const [comment, setComment] = useState(post.comments);
  const [menuOpen, setMenuOpen] = useState(false);
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };

  const likeOrDislikeHandler = async () => {
    try {
      const action = liked ? "dislike" : "like";
      const res = await axios.get(
        `https://snapsphere-jwj8.onrender.com/api/v1/post/${post._id}/${action}`,
        { withCredentials: true },
      );
      console.log(res.data);
      if (res.data.success) {
        const updatedLikes = liked ? postLike - 1 : postLike + 1;
        setPostLike(updatedLikes);
        setLiked(!liked);

        // apne post ko update krunga
        const updatedPostData = posts.map((p) =>
          p._id === post._id
            ? {
                ...p,
                likes: liked
                  ? p.likes.filter((id) => id !== user._id)
                  : [...p.likes, user._id],
              }
            : p,
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const commentHandler = async () => {
    try {
      const res = await axios.post(
        `https://snapsphere-jwj8.onrender.com/api/v1/post/${post._id}/comment`,
        { text },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );
      console.log(res.data);
      if (res.data.success) {
        const newComment = res.data.comment;

// Always clear input + toast
setText("");

// ✅ If approved → show in public feed comments
if (newComment.status === "approved") {
  const updatedCommentData = [...comment, newComment];
  setComment(updatedCommentData);

  const updatedPostData = posts.map((p) =>
    p._id === post._id ? { ...p, comments: updatedCommentData } : p
  );

  dispatch(setPosts(updatedPostData));
} else {
  // ❗ Not approved → do NOT add to feed public comments
  // You can optionally show message to user
  toast.message(
    newComment.status === "flagged"
      ? "Your comment is under review."
      : newComment.status === "shadow"
      ? "Your comment is hidden (spam detected)."
      : newComment.status === "rejected"
      ? "Your comment was rejected."
      : "Your comment is pending."
  );
}


        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deletePostHandler = async () => {
    try {
      const res = await axios.delete(
        `https://snapsphere-jwj8.onrender.com/api/v1/post/delete/${post?._id}`,
        { withCredentials: true },
      );

      if (res.data.success) {
        const updatedPostData = posts.filter((p) => p?._id !== post?._id);
        dispatch(setPosts(updatedPostData));

        // close menu + clear selected post (optional)
        setMenuOpen(false);
        dispatch(setSelectedPost(null));

        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to delete post");
    }
  };

  const bookmarkHandler = async () => {
    try {
      const res = await axios.get(
        `https://snapsphere-jwj8.onrender.com/api/v1/post/${post?._id}/bookmark`,
        { withCredentials: true },
      );
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="my-8 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            to={`/profile/${post.author?._id}`}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Avatar>
              <AvatarImage src={post.author?.profilePicture} alt="post_image" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-3">
              <h1>{post.author?.username}</h1>
              {user?._id === post.author._id && (
                <Badge variant="secondary">Author</Badge>
              )}
            </div>
          </Link>
        </div>
        {String(user?._id) === String(post?.author?._id) && (
          <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
            <DialogTrigger asChild>
              <MoreHorizontal className="cursor-pointer" />
            </DialogTrigger>

            <DialogContent className="flex flex-col items-center text-sm text-center">
              <Button
                onClick={deletePostHandler}
                variant="ghost"
                className="cursor-pointer w-fit text-[#ED4956] font-bold"
              >
                Delete
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <img
        className="rounded-sm my-2 w-full aspect-square object-cover"
        src={post.image}
        alt="post_img"
      />

      <div className="flex items-center justify-between my-2">
        <div className="flex items-center gap-3">
          {liked ? (
            <FaHeart
              onClick={likeOrDislikeHandler}
              size={"24"}
              className="cursor-pointer text-red-600"
            />
          ) : (
            <FaRegHeart
              onClick={likeOrDislikeHandler}
              size={"22px"}
              className="cursor-pointer hover:text-gray-600"
            />
          )}

          <MessageCircle
            onClick={() => {
              dispatch(setSelectedPost(post));
              setOpen(true);
            }}
            className="cursor-pointer hover:text-gray-600"
          />
          <Send className="cursor-pointer hover:text-gray-600" />
        </div>
        <Bookmark
          onClick={bookmarkHandler}
          className="cursor-pointer hover:text-gray-600"
        />
      </div>
      <span className="font-medium block mb-2">{postLike} likes</span>
      <p>
  <span className="font-medium mr-2">{post.author?.username}</span>
  {post.caption}
</p>

{/* View all comments */}
{comment.length > 0 && (
  <span
    onClick={() => {
      dispatch(setSelectedPost(post));
      setOpen(true);
    }}
    className="cursor-pointer text-sm text-gray-400"
  >
    View all {comment.length} comments
  </span>
)}

      <CommentDialog open={open} setOpen={setOpen} />
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Add a comment..."
          value={text}
          onChange={changeEventHandler}
          className="outline-none text-sm w-full"
        />
        {text && (
          <span
            onClick={commentHandler}
            className="text-[#3BADF8] cursor-pointer"
          >
            Post
          </span>
        )}
      </div>
    </div>
  );
};

export default Post;
