import { useEffect } from "react";
import ChatPage from "./components/ChatPage";
import EditProfile from "./components/EditProfile";
import Home from "./components/Home";
import Login from "./components/Login";
import MainLayout from "./components/MainLayout";
import Profile from "./components/Profile";
import Signup from "./components/Signup";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setOnlineUsers } from "./redux/chatSlice";
import { setLikeNotification } from "./redux/rtnSlice";
import ProtectedRoutes from "./components/ProtectedRoutes";
import AuthSuccess from "./components/AuthSuccess";
import useGetMe from "@/hooks/useGetMe";
import useGetRTM from "@/hooks/useGetRTM";
import { Toaster } from "sonner";

import { connectSocket, disconnectSocket } from "@/socket/socketClient";

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoutes>
        <MainLayout />
      </ProtectedRoutes>
    ),
    children: [
      { path: "/", element: <ProtectedRoutes><Home /></ProtectedRoutes> },
      { path: "/profile/:id", element: <ProtectedRoutes><Profile /></ProtectedRoutes> },
      { path: "/account/edit", element: <ProtectedRoutes><EditProfile /></ProtectedRoutes> },
      { path: "/chat", element: <ProtectedRoutes><ChatPage /></ProtectedRoutes> },
      { path: "/auth/success", element: <AuthSuccess /> },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
]);

function App() {
  useGetMe();

  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  // ✅ Run RTM hook only after user is available (prevents early socket events)
  useGetRTM(user?._id);

  useEffect(() => {
    if (!user?._id) {
      disconnectSocket();
      return;
    }

    const socketio = connectSocket(user._id);

    socketio.on("getOnlineUsers", (onlineUsers) => {
      dispatch(setOnlineUsers(onlineUsers));
    });

    socketio.on("notification", (notification) => {
      dispatch(setLikeNotification(notification));
    });

    socketio.on("newMessage", (m) => {
      console.log("✅ FRONTEND GOT newMessage:", m);
    });

    return () => {
      socketio.off("getOnlineUsers");
      socketio.off("notification");
      socketio.off("newMessage");
      disconnectSocket();
    };
  }, [user?._id, dispatch]);

  return (
    <>
      <Toaster position="top-right" richColors />
      <RouterProvider router={browserRouter} />
    </>
  );
}

export default App;
