import { setSuggestedUsers } from "@/redux/authSlice";
import api from "@/api/axios";
import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetSuggestedUsers = () => {
  const dispatch = useDispatch();

  const fetchSuggestedUsers = useCallback(async () => {
    try {
      const res = await api.get("/user/suggested");

      if (res.data?.success) {
        dispatch(setSuggestedUsers(res.data.users));
      }
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  // auto-fetch on mount (same behavior as before)
  useEffect(() => {
    fetchSuggestedUsers();
  }, [fetchSuggestedUsers]);

  // 👇 keep returning the function (used elsewhere)
  return fetchSuggestedUsers;
};

export default useGetSuggestedUsers;
