import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    onlineUsers: [],
    messages: [],
    unreadCounts: {},        // { userId: number }
    activeChatUserId: null,  // currently opened chat user
  },
  reducers: {
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },

    setMessages: (state, action) => {
      state.messages = action.payload;
    },

    pushMessage: (state, action) => {
      state.messages.push(action.payload);
    },

    // ✅ increment unread badge
    incrementUnread: (state, action) => {
      const userId = action.payload;
      state.unreadCounts[userId] = (state.unreadCounts[userId] || 0) + 1;
    },

    // ✅ clear unread when chat opened
    clearUnread: (state, action) => {
      const userId = action.payload;
      state.unreadCounts[userId] = 0;
    },

    // ✅ mark active chat
    setActiveChatUserId: (state, action) => {
      state.activeChatUserId = action.payload;
    },
  },
});

export const {
  setOnlineUsers,
  setMessages,
  pushMessage,
  incrementUnread,
  clearUnread,
  setActiveChatUserId, // ✅ EXPORT EXISTS NOW
} = chatSlice.actions;

export default chatSlice.reducer;
