import {createSlice} from "@reduxjs/toolkit"

const authSlice = createSlice({
    name:"auth",
    initialState:{
        user:null,
        suggestedUsers:[],
        userProfile:null,
        selectedUser:null,
        userPosts: [],
    },
    reducers:{
        toggleFollowUser: (state, action) => {
  const myId = action.payload.myId;
  const isFollowingNow = action.payload.following;

  if (!state.userProfile) return;

  if (isFollowingNow) {
    // FOLLOW → add myId to followers
    if (!state.userProfile.followers.includes(myId)) {
      state.userProfile.followers.push(myId);
    }
  } else {
    // UNFOLLOW → remove myId from followers
    state.userProfile.followers = state.userProfile.followers.filter(
      (id) => id !== myId
    );
  }
},
        // actions
        setAuthUser:(state,action) => {
            state.user = action.payload;
        },
        setSuggestedUsers:(state,action) => {
            state.suggestedUsers = action.payload;
        },
        setUserProfile:(state,action) => {
            state.userProfile = action.payload;
        },
        setSelectedUser:(state,action) => {
            state.selectedUser = action.payload;
        },setUserPosts: (state, action) => {
      state.userPosts = action.payload;
    },
    }
});
export const {
    setAuthUser, 
    setSuggestedUsers, 
    setUserProfile,
    setSelectedUser,
    setUserPosts,
    toggleFollowUser,
} = authSlice.actions;
export default authSlice.reducer;