import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { pushMessage, incrementUnread } from "@/redux/chatSlice";
import { toast } from "sonner";

const useGetRTM = () => {
  const dispatch = useDispatch();

  const { socket } = useSelector((store) => store.socketio);
  const { user } = useSelector((store) => store.auth);
  const { activeChatUserId } = useSelector((store) => store.chat);

  const myId = user?._id;

  useEffect(() => {
    // ✅ do nothing until socket + user ready
    if (!socket || !myId) return;

    const handler = (m) => {
      // ✅ Always push message to store
      dispatch(pushMessage(m));

      const receiverId = m?.receiverId ? String(m.receiverId) : "";
      const senderId = m?.senderId ? String(m.senderId) : "";

      // ✅ only receiver should get unread + toast
      if (receiverId === String(myId)) {
        // ✅ unread only if that sender chat is NOT open
        if (senderId && senderId !== String(activeChatUserId || "")) {
          dispatch(incrementUnread(senderId));
          toast(`New message: ${m?.message ?? ""}`);
        }
      }
    };

    // ✅ prevent double listener
    socket.off("newMessage", handler);
    socket.on("newMessage", handler);

    return () => {
      socket.off("newMessage", handler);
    };
  }, [socket, myId, dispatch, activeChatUserId]);
};

export default useGetRTM;
