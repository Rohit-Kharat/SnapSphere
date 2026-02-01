import { useEffect } from "react";
import api from "@/api/axios";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";

const useGetMe = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/user/me");

        if (res.data?.success) {
          dispatch(setAuthUser(res.data.user)); // ✅ user now has populated bookmarks
        }
      } catch (err) {
        // not logged in → silently ignore
      }
    };

    fetchMe();
  }, [dispatch]);
};

export default useGetMe;
