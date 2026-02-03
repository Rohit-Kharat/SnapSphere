import { setSuggestedUsers } from "@/redux/authSlice";
import axios from "axios";
import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetSuggestedUsers = () => {
  const dispatch = useDispatch();

  const fetchSuggestedUsers = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/v1/user/suggested",
        { withCredentials: true }
      );

      if (res.data.success) {
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

  // 👇 THIS is the key difference
  return fetchSuggestedUsers;
};

export default useGetSuggestedUsers;
