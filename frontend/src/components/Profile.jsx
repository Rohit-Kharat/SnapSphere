import React, { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import { Link, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AtSign, Heart, MessageCircle } from "lucide-react";
import useGetUserPost from "@/hooks/useGetUserPost";
import { followOrUnfollow } from "../api/userApi";
import { toggleFollowUser } from "@/redux/authSlice";

const Profile = () => {
  const { id: userId } = useParams();
  const dispatch = useDispatch();

  useGetUserProfile(userId);
  useGetUserPost();

  const [activeTab, setActiveTab] = useState("posts");
  const [btnLoading, setBtnLoading] = useState(false);

  const { userProfile = {}, user = {}, userPosts = [] } = useSelector(
    (store) => store.auth
  );

  const myId = user?._id;
  const profileId = userProfile?._id;

  const isLoggedInUserProfile = String(myId) === String(profileId);

  const isFollowing = useMemo(() => {
    if (!myId || !profileId) return false;
    return (userProfile?.followers || []).some(
      (uid) => String(uid) === String(myId)
    );
  }, [myId, profileId, userProfile?.followers]);

  const displayedPosts =
    activeTab === "posts"
      ? isLoggedInUserProfile
        ? userPosts
        : userProfile?.posts || []
      : isLoggedInUserProfile
        ? user?.bookmarks || []
        : userProfile?.bookmarks || [];

  const handleFollowToggle = async () => {
    if (!profileId) return;
    if (!myId) return alert("Please login again");

    try {
      setBtnLoading(true);

      const res = await followOrUnfollow(profileId);
      const followingNow = res.data?.following;

      dispatch(
        toggleFollowUser({
          myId,
          following: followingNow,
        })
      );
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Something went wrong");
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="flex max-w-5xl justify-center mx-auto pl-0 md:pl-10 pb-16 md:pb-0">
      <div className="flex flex-col gap-8 md:gap-20 p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0">
          <section className="flex items-center justify-center">
            <Avatar className="h-32 w-32">
              <AvatarImage src={userProfile?.profilePicture || ""} alt="profilephoto" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </section>

          <section>
            <div className="flex flex-col items-center md:items-start gap-5">
              <div className="flex items-center gap-2">
                <span>{userProfile?.username || "Unknown User"}</span>

                {isLoggedInUserProfile ? (
                  <Link to="/account/edit">
                    <Button variant="secondary" className="hover:bg-gray-200 h-8">
                      Edit profile
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Button
                      onClick={handleFollowToggle}
                      disabled={btnLoading}
                      className={`h-8 ${isFollowing
                          ? "bg-gray-200 text-black hover:bg-gray-300"
                          : "bg-[#0095F6] hover:bg-[#3192d2]"
                        }`}
                    >
                      {btnLoading ? "..." : isFollowing ? "Unfollow" : "Follow"}
                    </Button>

                    {isFollowing && (
                      <Button variant="secondary" className="h-8">
                        Message
                      </Button>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center justify-center md:justify-start gap-4">
                <p>
                  <span className="font-semibold">{userProfile?.posts?.length || 0} </span>
                  posts
                </p>
                <p>
                  <span className="font-semibold">{userProfile?.followers?.length || 0} </span>
                  followers
                </p>
                <p>
                  <span className="font-semibold">{userProfile?.following?.length || 0} </span>
                  following
                </p>
              </div>

              <div className="flex flex-col items-center md:items-start gap-1">
                <span className="font-semibold text-center md:text-left">{userProfile?.bio || "bio here..."}</span>
                <Badge className="w-fit" variant="secondary">
                  <AtSign /> <span className="pl-1">{userProfile?.username || "Unknown User"}</span>
                </Badge>
              </div>
            </div>
          </section>
        </div>

        <div className="border-t border-t-gray-200">
          <div className="flex items-center justify-center gap-10 text-sm">
            <span
              className={`py-3 cursor-pointer ${activeTab === "posts" ? "font-bold" : ""}`}
              onClick={() => setActiveTab("posts")}
            >
              POSTS
            </span>
            <span
              className={`py-3 cursor-pointer ${activeTab === "saved" ? "font-bold" : ""}`}
              onClick={() => setActiveTab("saved")}
            >
              SAVED
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {displayedPosts.map((post) => (
              <div key={post?._id} className="relative group cursor-pointer">
                <img
                  src={post?.image || "https://via.placeholder.com/150"}
                  alt="postimage"
                  className="rounded-sm my-2 w-full aspect-square object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center text-white space-x-4">
                    <button className="flex items-center gap-2 hover:text-gray-300">
                      <Heart />
                      <span>{post?.likes?.length || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-gray-300">
                      <MessageCircle />
                      <span>{post?.comments?.length || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
