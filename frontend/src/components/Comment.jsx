import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSelector } from "react-redux";

const Comment = ({ comment }) => {
  const { user } = useSelector((store) => store.auth);

  const authorId = comment?.author?._id || comment?.author;
  const isAuthor = String(user?._id) === String(authorId);

  // Hide non-approved comments from everyone except author
  if (comment?.status !== "approved" && !isAuthor) return null;

  const label =
    comment?.status === "pending"
      ? "Pending"
      : comment?.status === "flagged"
      ? "Under review"
      : comment?.status === "shadow"
      ? "Hidden"
      : comment?.status === "rejected"
      ? "Rejected"
      : "";

  return (
    <div className="my-2">
      <div className="flex gap-3 items-start">
        <Avatar>
          <AvatarImage src={comment?.author?.profilePicture} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-sm">{comment?.author?.username}</h1>

            {comment?.status !== "approved" && isAuthor && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-gray-200">
                {label}
              </span>
            )}
          </div>

          <p className={comment?.status === "approved" ? "text-sm" : "text-sm opacity-60"}>
            {comment?.text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Comment;
