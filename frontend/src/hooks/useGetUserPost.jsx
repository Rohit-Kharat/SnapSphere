import { useEffect } from "react";
import api from "@/api/axios";
import { useDispatch } from "react-redux";
import { setUserPosts } from "@/redux/authSlice";

const useGetUserPost = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const res = await api.get("/post/userpost/all");

        if (res.data?.success) {
          dispatch(setUserPosts(res.data.posts || []));
        }
      } catch (err) {
        console.log("useGetUserPost error:", err);
      }
    };

    fetchUserPosts();
  }, [dispatch]);
};

export default useGetUserPost;
