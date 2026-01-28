import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import Comment from "./Comment";
import axios from "axios";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setPosts, setSelectedPost } from "@/redux/postSlice";

const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState("");
  const [commentList, setCommentList] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  const dispatch = useDispatch();
  const { selectedPost, posts } = useSelector((store) => store.post);
  const { user } = useSelector((store) => store.auth);

  useEffect(() => {
    setCommentList(selectedPost?.comments || []);
  }, [selectedPost]);

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    setText(inputText.trim() ? inputText : "");
  };

  const sendMessageHandler = async () => {
    try {
      if (!selectedPost?._id) return;

      const res = await axios.post(
        `http://localhost:8000/api/v1/post/${selectedPost._id}/comment`,
        { text },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        const updated = [...commentList, res.data.comment];
        setCommentList(updated);

        const updatedPosts = posts.map((p) =>
          String(p._id) === String(selectedPost._id)
            ? { ...p, comments: updated }
            : p
        );
        dispatch(setPosts(updatedPosts));
        dispatch(setSelectedPost({ ...selectedPost, comments: updated }));

        toast.success(res.data.message);
        setText("");
      } else {
        toast.error(res.data.message || "Failed to add comment");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to add comment");
    }
  };

  const deleteCommentHandler = async (commentId) => {
    try {
      const postId = selectedPost?._id;
      if (!postId || !commentId) return;

      const res = await axios.delete(
        `http://localhost:8000/api/v1/post/comment/${commentId}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        const updated = commentList.filter(
          (c) => String(c._id) !== String(commentId)
        );
        setCommentList(updated);

        const updatedPosts = posts.map((p) =>
          String(p._id) === String(postId) ? { ...p, comments: updated } : p
        );
        dispatch(setPosts(updatedPosts));
        dispatch(setSelectedPost({ ...selectedPost, comments: updated }));

        setOpenMenuId(null);
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to delete comment");
    }
  };

const canDeleteComment = (c) => {
  const commentAuthorId = c?.author?._id || c?.author; // ✅ author (not user)
  const isCommentOwner = String(user?._id) === String(commentAuthorId);

  const isPostOwner = String(user?._id) === String(selectedPost?.author?._id);

  return isCommentOwner || isPostOwner;
};


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        onInteractOutside={() => setOpen(false)}
        className="max-w-5xl p-0 flex flex-col"
      >
        <div className="flex flex-1">
          <div className="w-1/2">
            <img
              src={selectedPost?.image}
              alt="post_img"
              className="w-full h-full object-cover rounded-l-lg"
            />
          </div>

          <div className="w-1/2 flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex gap-3 items-center">
                <Link>
                  <Avatar>
                    <AvatarImage src={selectedPost?.author?.profilePicture} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link className="font-semibold text-xs">
                    {selectedPost?.author?.username}
                  </Link>
                </div>
              </div>
            </div>

            <hr />

            {/* Comments */}
            <div className="flex-1 overflow-y-auto max-h-96 p-4 space-y-3">
              {commentList.map((c) => (
                <div
                  key={c._id}
                  className="flex items-start justify-between gap-2"
                >
                  <Comment comment={c} />

                  {canDeleteComment(c) && (
                    <Dialog
                      open={openMenuId === c._id}
                      onOpenChange={(v) => setOpenMenuId(v ? c._id : null)}
                    >
                      <DialogTrigger asChild>
                        <button type="button">
                          <MoreHorizontal className="cursor-pointer" />
                        </button>
                      </DialogTrigger>

                      <DialogContent className="flex flex-col items-center text-sm text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-[#ED4956] font-bold"
                          onClick={() => deleteCommentHandler(c._id)}
                        >
                          Delete
                        </Button>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              ))}
            </div>

            {/* Add comment */}
            <div className="p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={changeEventHandler}
                  placeholder="Add a comment..."
                  className="w-full outline-none border text-sm border-gray-300 p-2 rounded"
                />
                <Button
                  disabled={!text.trim()}
                  onClick={sendMessageHandler}
                  variant="outline"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
