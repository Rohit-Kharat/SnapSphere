import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { setSelectedUser } from "@/redux/authSlice";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { MessageCircleCode } from "lucide-react";
import Messages from "./Messages";
import axios from "axios";

import {
  clearUnread,
  setActiveChatUserId,
  pushMessage,
} from "@/redux/chatSlice";

const ChatPage = () => {
  const [textMessage, setTextMessage] = useState("");

  const dispatch = useDispatch();

  const { user, suggestedUsers = [], selectedUser } = useSelector(
    (store) => store.auth
  );

  const { onlineUsers = [], unreadCounts = {} } = useSelector(
    (store) => store.chat
  );

  // ✅ onlineUsers may contain ObjectIds/strings — make safe compare
  const onlineSet = useMemo(() => {
    return new Set((onlineUsers || []).map((id) => String(id)));
  }, [onlineUsers]);

  const sendMessageHandler = async () => {
    try {
      if (!selectedUser?._id) return;
      const msg = textMessage.trim();
      if (!msg) return;

      // Optimistic: you can also show instantly if you want
      // dispatch(pushMessage({ senderId: user?._id, receiverId: selectedUser?._id, message: msg }))

      const res = await axios.post(
        `https://snapsphere-jwj8.onrender.com/api/v1/message/send/${selectedUser._id}`,
        { textMessage: msg },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        // ✅ push single message (dedupe logic in slice helps)
        dispatch(pushMessage(res.data.newMessage));
        setTextMessage("");
      }
    } catch (error) {
      console.error("sendMessageHandler error:", error);
    }
  };

  // ✅ On leaving ChatPage: clean state
  useEffect(() => {
    return () => {
      dispatch(setSelectedUser(null));
      dispatch(setActiveChatUserId(null));
    };
  }, [dispatch]);

  return (
    <div className="flex ml-[16%] h-screen">
      {/* LEFT USERS LIST */}
      <section className="w-full md:w-1/4 my-8">
        <h1 className="font-bold mb-4 px-3 text-xl">{user?.username}</h1>
        <hr className="mb-4 border-gray-300" />

        <div className="overflow-y-auto h-[80vh]">
          {Array.isArray(suggestedUsers) && suggestedUsers.length > 0 ? (
            suggestedUsers.map((suggestedUser) => {
              const sid = String(suggestedUser?._id || "");
              const isOnline = onlineSet.has(sid);
              const unread = unreadCounts[sid] || 0;

              return (
                <div
                  key={sid}
                  onClick={() => {
                    dispatch(setSelectedUser(suggestedUser));
                    dispatch(setActiveChatUserId(suggestedUser?._id));
                    dispatch(clearUnread(suggestedUser?._id));
                  }}
                  className="flex gap-3 items-center p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={suggestedUser?.profilePicture} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col">
                    <span className="font-medium">{suggestedUser?.username}</span>
                    <span
                      className={`text-xs font-bold ${
                        isOnline ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isOnline ? "online" : "offline"}
                    </span>
                  </div>

                  {unread > 0 && (
                    <div className="ml-auto min-w-[22px] h-[22px] px-2 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">
                      {unread > 99 ? "99+" : unread}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-center">No suggested users available.</p>
          )}
        </div>
      </section>

      {/* RIGHT CHAT BOX */}
      {selectedUser ? (
        <section className="flex-1 border-l border-l-gray-300 flex flex-col h-full">
          {/* HEADER */}
          <div className="flex gap-3 items-center px-3 py-2 border-b border-gray-300 sticky top-0 bg-white z-10">
            <Avatar>
              <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span>{selectedUser?.username}</span>
            </div>
          </div>

          {/* MESSAGES */}
          <Messages selectedUser={selectedUser} />

          {/* INPUT */}
          <div className="flex items-center p-4 border-t border-t-gray-300">
            <Input
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              type="text"
              className="flex-1 mr-2 focus-visible:ring-transparent"
              placeholder="Message..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessageHandler();
                }
              }}
            />

            <Button
              disabled={!textMessage.trim() || !selectedUser?._id}
              onClick={sendMessageHandler}
            >
              Send
            </Button>
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center mx-auto">
          <MessageCircleCode className="w-32 h-32 my-4" />
          <h1 className="font-medium">Your messages</h1>
          <span>Send a message to start a chat.</span>
        </div>
      )}
    </div>
  );
};

export default ChatPage;