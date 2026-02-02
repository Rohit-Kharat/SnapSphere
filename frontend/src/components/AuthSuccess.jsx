import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setAuthUser } from "@/redux/authSlice";
import { toast } from "sonner";

const AuthSuccess = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await axios.get("https://snapsphere-jwj8.onrender.com/api/v1/user/me", {
          withCredentials: true,
        });

        if (res.data.success) {
          dispatch(setAuthUser(res.data.user));
          toast.success("Logged in with Google");
          navigate("/", { replace: true });
        } else {
          navigate("/login", { replace: true });
        }
      } catch (err) {
        navigate("/login", { replace: true });
      }
    };

    loadMe();
  }, [dispatch, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Signing you in…</p>
    </div>
  );
};

export default AuthSuccess;
