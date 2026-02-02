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
import { setSocket } from "@/redux/socketSlice"; // ✅ ADD THIS

const browserRouter = createBrowserRouter([
  // ✅ OAuth landing page should be PUBLIC (no ProtectedRoutes)
  { path: "/auth/success", element: <AuthSuccess /> },

  // ✅ Public routes
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },

  // ✅ Protected app shell with layout
  {
    path: "/",
    element: (
      <ProtectedRoutes>
        <MainLayout />
      </ProtectedRoutes>
    ),
    children: [
      { index: true, element: <Home /> },              // ✅ home
      { path: "profile/:id", element: <Profile /> },   // ✅ no leading /
      { path: "account/edit", element: <EditProfile /> },
      { path: "chat", element: <ChatPage /> },
    ],
  },
]);


function App() {
  useGetMe();
  useGetRTM();

  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    // if user not logged in → disconnect + clear redux socket
    if (!user?._id) {
      disconnectSocket();
      dispatch(setSocket(null));
      return;
    }

    const socketio = connectSocket(user._id);

    // ✅ store in redux so hooks can access it
    dispatch(setSocket(socketio));

    // listeners
    socketio.on("getOnlineUsers", (onlineUsers) => {
      dispatch(setOnlineUsers(onlineUsers));
    });

    socketio.on("notification", (notification) => {
      dispatch(setLikeNotification(notification));
    });

    // cleanup
    return () => {
      socketio.off("getOnlineUsers");
      socketio.off("notification");
      disconnectSocket();
      dispatch(setSocket(null));
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
