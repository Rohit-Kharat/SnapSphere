import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { pushMessage, incrementUnread } from "@/redux/chatSlice";
import { toast } from "sonner";

const useGetRTM = () => {
  const dispatch = useDispatch();
  const { socket } = useSelector((store) => store.socketio);
  const { user } = useSelector((store) => store.auth);
  const { activeChatUserId } = useSelector((store) => store.chat);

  useEffect(() => {
    if (!socket) return;

    const handler = (m) => {
      // 1️⃣ add message to store
      dispatch(pushMessage(m));

      // 2️⃣ only receiver should get unread + toast
      if (m?.receiverId?.toString() === user?._id?.toString()) {
        const senderId = m?.senderId?.toString();

        console.log("UNREAD CHECK sender:", senderId);

        // 3️⃣ unread only if that sender chat is NOT open
        if (senderId && senderId !== activeChatUserId) {
          dispatch(incrementUnread(senderId));
          toast(`New message: ${m?.message ?? ""}`);
        }
      }
    };

    socket.on("newMessage", handler);
    return () => socket.off("newMessage", handler);
  }, [socket, dispatch, user?._id, activeChatUserId]);
};

export default useGetRTM;
