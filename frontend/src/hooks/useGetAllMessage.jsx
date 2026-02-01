import { setMessages } from "@/redux/chatSlice";
import api from "@/api/axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetAllMessage = () => {
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((store) => store.auth);

  useEffect(() => {
    if (!selectedUser?._id) return;

    const fetchAllMessages = async () => {
      try {
        const res = await api.get(`/message/all/${selectedUser._id}`);

        if (res.data?.success) {
          dispatch(setMessages(res.data.messages));
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchAllMessages();
  }, [selectedUser?._id, dispatch]);
};

export default useGetAllMessage;
