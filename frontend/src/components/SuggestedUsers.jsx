import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import useGetSuggestedUsers from "@/hooks/useGetSuggestedUsers";

const SuggestedUsers = () => {
  const { suggestedUsers, user } = useSelector((store) => store.auth);
  const [loadingId, setLoadingId] = useState(null);

  // See All toggle
  const [seeAll, setSeeAll] = useState(false);

  // local follow toggle (instant UI)
  const [followingSet, setFollowingSet] = useState(new Set(user?.following || []));
  useEffect(() => {
    setFollowingSet(new Set(user?.following || []));
  }, [user]);

  const refetchSuggestedUsers = useGetSuggestedUsers();

  const handleFollow = async (targetUserId) => {
    const wasFollowing = followingSet.has(targetUserId);

    // optimistic
    setFollowingSet((prev) => {
      const next = new Set(prev);
      if (wasFollowing) next.delete(targetUserId);
      else next.add(targetUserId);
      return next;
    });

    try {
      setLoadingId(targetUserId);

      await axios.post(
        `https://snapsphere-jwj8.onrender.com/api/v1/user/followorunfollow/${targetUserId}`,
        {},
        { withCredentials: true }
      );

      // optional refresh
      refetchSuggestedUsers?.();
    } catch (error) {
      console.log(error);

      // rollback
      setFollowingSet((prev) => {
        const next = new Set(prev);
        if (wasFollowing) next.add(targetUserId);
        else next.delete(targetUserId);
        return next;
      });
    } finally {
      setLoadingId(null);
    }
  };

  if (!suggestedUsers || suggestedUsers.length === 0) {
    return <div className="my-10 text-gray-600">No suggestions available.</div>;
  }

  const visibleUsers = seeAll ? suggestedUsers : suggestedUsers.slice(0, 5);

  return (
    <div className="my-10">
      <div className="flex items-center justify-between text-sm">
        <h1 className="font-semibold text-gray-600">Suggested for you</h1>

        <button
          onClick={() => setSeeAll((p) => !p)}
          className="font-medium cursor-pointer select-none"
        >
          {seeAll ? "Back" : "See All"}
        </button>
      </div>

      {/* Animated container */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          seeAll ? "max-h-[1200px] opacity-100" : "max-h-[420px] opacity-100"
        }`}
      >
        {visibleUsers.map((u) => {
          const isFollowing = followingSet.has(u._id);
          const isLoading = loadingId === u._id;

          return (
            <div
              key={u._id}
              className={`flex items-center justify-between my-5 transform transition-all duration-300 ${
                seeAll ? "translate-y-0 opacity-100" : "translate-y-0 opacity-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <Link to={`/profile/${u._id}`}>
                  <Avatar>
                    <AvatarImage
                      src={u?.profilePicture}
                      alt={`${u?.username}'s profile`}
                    />
                    <AvatarFallback>
                      {u?.username?.split(" ").map((name) => name[0]).join("") || "NA"}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <div>
                  <h1 className="font-semibold text-sm">
                    <Link to={`/profile/${u._id}`}>{u?.username}</Link>
                  </h1>
                  <span className="text-gray-600 text-sm">{u?.bio || "Bio here..."}</span>
                </div>
              </div>

              <button
                disabled={isLoading}
                onClick={() => handleFollow(u._id)}
                className={`text-xs font-bold hover:opacity-80 disabled:opacity-60 ${
                  isFollowing ? "text-gray-600" : "text-[#3BADF8]"
                }`}
              >
                {isLoading ? "..." : isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SuggestedUsers;
