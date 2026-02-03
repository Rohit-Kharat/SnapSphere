import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";

const useGetMe = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/user/me", {
          withCredentials: true,
        });

        if (res.data?.success) {
          dispatch(setAuthUser(res.data.user)); // ✅ user now has populated bookmarks
        }
      } catch (err) {
        // if not logged in, ignore
        // console.log("getMe error:", err?.response?.data || err.message);
      }
    };

    fetchMe();
  }, [dispatch]);
};

export default useGetMe;
