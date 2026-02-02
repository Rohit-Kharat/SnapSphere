import React, { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import useGetAllMessage from "@/hooks/useGetAllMessage";

const Messages = ({ selectedUser }) => {
  // ✅ fetch messages when selectedUser changes
  useGetAllMessage();

  const { messages = [] } = useSelector((store) => store.chat);
  const { user } = useSelector((store) => store.auth);

  const bottomRef = useRef(null);

  // ✅ Auto scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length, selectedUser?._id]);

  return (
    <div className="overflow-y-auto flex-1 p-4">
      {/* Header */}
      <div className="flex justify-center">
        <div className="flex flex-col items-center justify-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>

          <span className="mt-2">{selectedUser?.username}</span>

          <Link to={`/profile/${selectedUser?._id}`}>
            <Button className="h-8 my-2" variant="secondary">
              View profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-3 mt-4">
        {Array.isArray(messages) &&
          messages.map((msg) => {
            const isMine =
              String(msg?.senderId) === String(user?._id);

            return (
              <div
                key={msg?._id || `${msg?.senderId}-${msg?.createdAt}-${Math.random()}`}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-2 rounded-lg max-w-xs break-words ${
                    isMine
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {msg?.message ?? msg?.textMessage ?? ""}
                </div>
              </div>
            );
          })}

        {/* scroll anchor */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Messages;
