import { setMessages } from "@/redux/chatSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetAllMessage = () => {
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((store) => store.auth);

  useEffect(() => {
    if (!selectedUser?._id) return;

    const fetchAllMessages = async () => {
      try {
        const res = await axios.get(
          `https://snapsphere-jwj8.onrender.com/api/v1/message/all/${selectedUser._id}`,
          { withCredentials: true }
        );

        if (res.data.success) {
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
