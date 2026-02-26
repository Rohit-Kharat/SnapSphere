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

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { user } = useSelector(store => store.auth);
  const likeNotification = useSelector(
    (store) => store.realTimeNotification?.likeNotification
  ) || [];

  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);



  const logoutHandler = async () => {
    try {
      const res = await axios.get('https://snapsphere-jwj8.onrender.com/api/v1/user/logout', { withCredentials: true });
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
    <div className='fixed md:top-0 bottom-0 z-10 left-0 px-4 md:border-r border-t md:border-t-0 border-gray-300 w-full md:w-[16%] h-16 md:h-screen bg-white'>
      <div className='flex flex-row md:flex-col h-full md:h-auto'>
        <h1 className='hidden md:block my-8 pl-3 font-bold text-xl'>SnapSphere</h1>
        <div className='flex flex-row md:flex-col justify-around md:justify-start w-full gap-2 md:gap-0 h-full md:h-auto items-center md:items-stretch'>
          {sidebarItems.map((item, index) => {
            // ✅ Special UI for Notifications
            if (item.text === "Notifications") {
              return (
                <Popover key={index}>
                  <PopoverTrigger asChild>
                    <div
                      onClick={(e) => e.stopPropagation()} // prevent parent click side effects
                      className="flex items-center gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 md:my-3"
                    >
                      <Heart className="w-5 h-5" />
                      <span className="hidden md:block">Notifications</span>

                      {likeNotification?.length > 0 && (
                        <span className="absolute md:top-2 md:left-6 top-1 right-1 md:right-auto bg-red-600 text-white text-[10px] rounded-full px-1.5 py-0.5">
                          {likeNotification.length}
                        </span>
                      )}
                    </div>
                  </PopoverTrigger>

                  <PopoverContent onClick={(e) => e.stopPropagation()}>
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
                className="flex items-center gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 md:my-3"
              >
                {item.icon}
                <span className="hidden md:block">{item.text}</span>
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
