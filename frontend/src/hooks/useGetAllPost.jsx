import { setPosts } from "@/redux/postSlice";
import api from "@/api/axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAllPost = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAllPost = async () => {
      try {
        const res = await api.get("/post/all");

        if (res.data?.success) {
          dispatch(setPosts(res.data.posts));
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      }
    };

    fetchAllPost();
  }, [dispatch]);
};

export default useGetAllPost;
