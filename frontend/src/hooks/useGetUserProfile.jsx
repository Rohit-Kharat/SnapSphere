import { setUserProfile } from "@/redux/authSlice";
import api from "@/api/axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetUserProfile = (userId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId) return;

    const fetchUserProfile = async () => {
      try {
        const res = await api.get(`/user/${userId}/profile`);

        if (res.data?.success) {
          dispatch(setUserProfile(res.data.user));
        }
      } catch (error) {
        console.log("useGetUserProfile error:", error);
      }
    };

    fetchUserProfile();
  }, [userId, dispatch]);
};

export default useGetUserProfile;
