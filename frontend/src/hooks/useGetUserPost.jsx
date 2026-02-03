import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserPosts } from "@/redux/authSlice";

const useGetUserPost = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/post/userpost/all",
          { withCredentials: true }
        );

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
