import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";

const useGetMe = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axios.get(
          "https://snapsphere-jwj8.onrender.com/api/v1/user/me",
          { withCredentials: true }
        );

        if (res.data?.success) dispatch(setAuthUser(res.data.user));
        else dispatch(setAuthUser(null));
      } catch (err) {
        dispatch(setAuthUser(null));
      }
    };

    fetchMe();
  }, [dispatch]);
};

export default useGetMe;
