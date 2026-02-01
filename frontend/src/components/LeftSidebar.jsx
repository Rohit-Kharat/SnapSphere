import { Heart, Home, LogOut, MessageCircle, PlusSquare, Search, TrendingUp } from 'lucide-react'
import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { toast } from 'sonner'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthUser } from '@/redux/authSlice'
import CreatePost from './CreatePost'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
import { clearLikeNotification } from "@/redux/rtnSlice";

const LeftSidebar = () => {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
const likeNotification = useSelector(
  (store) => store.realTimeNotification?.likeNotification
) || [];
const [notifOpen, setNotifOpen] = useState(false);


    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);



    const logoutHandler = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/v1/user/logout', { withCredentials: true });
            if (res.data.success) {
                dispatch(setAuthUser(null));
                dispatch(setSelectedPost(null));
                dispatch(setPosts([]));
                navigate("/login");
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }

    const sidebarHandler = (textType) => {
        if (textType === 'Logout') {
            logoutHandler();
        } else if (textType === "Create") {
            setOpen(true);
        } else if (textType === "Profile") {
            navigate(`/profile/${user?._id}`);
        } else if (textType === "Home") {
            navigate("/");
        } else if (textType === 'Messages') {
            navigate("/chat");
        }
    }

    const sidebarItems = [
        { icon: <Home />, text: "Home" },
        { icon: <Search />, text: "Search" },
        { icon: <TrendingUp />, text: "Explore" },
        { icon: <MessageCircle />, text: "Messages" },
        { icon: <Heart />, text: "Notifications" },
        { icon: <PlusSquare />, text: "Create" },
        {
            icon: (
                <Avatar className='w-6 h-6'>
                    <AvatarImage src={user?.profilePicture} alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            ),
            text: "Profile"
        },
        { icon: <LogOut />, text: "Logout" },
    ]
    return (
        <div className='fixed top-0 z-10 left-0 px-4 border-r border-gray-300 w-[16%] h-screen'>
            <div className='flex flex-col'>
                <h1 className='my-8 pl-3 font-bold text-xl'>SnapSphere</h1>
                <div>
                    {sidebarItems.map((item, index) => {
  // ✅ Special UI for Notifications
  if (item.text === "Notifications") {
    return (
      <Popover
  open={notifOpen}
  onOpenChange={(v) => {
    setNotifOpen(v);
    if (v) dispatch(clearLikeNotification()); // ✅ clear when opened
  }}
>
  <PopoverTrigger asChild>
    <div className="flex items-center gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-3">
      <Heart className="w-5 h-5" />
      <span>Notifications</span>

      {likeNotification?.length > 0 && (
        <span className="absolute top-2 left-6 bg-red-600 text-white text-[10px] rounded-full px-1.5 py-0.5">
          {likeNotification.length}
        </span>
      )}
    </div>
  </PopoverTrigger>

  <PopoverContent>
    {likeNotification?.length === 0 ? (
      <p>No new notification</p>
    ) : (
      likeNotification.map((notification) => (
        <div key={notification.userId} className="flex items-center gap-2 my-2">
          <Avatar>
            <AvatarImage src={notification.userDetails?.profilePicture} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <p className="text-sm">
            <span className="font-bold">{notification.userDetails?.username}</span> liked your post
          </p>
        </div>
      ))
    )}
  </PopoverContent>
</Popover>
    );
  }

  // ✅ Normal items
  return (
    <div
      onClick={() => sidebarHandler(item.text)}
      key={index}
      className="flex items-center gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-3"
    >
      {item.icon}
      <span>{item.text}</span>
    </div>
  );
})}
                </div>
            </div>

            <CreatePost open={open} setOpen={setOpen} />

        </div>
    )
}

export default LeftSidebar