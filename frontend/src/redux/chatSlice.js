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
      state.onlineUsers = action.payload || [];
    },

    setMessages: (state, action) => {
      state.messages = action.payload || [];
    },

    // ✅ push + prevent duplicates
    pushMessage: (state, action) => {
      const msg = action.payload;
      if (!msg) return;

      // if your message has _id from DB, dedupe using that
      if (msg._id) {
        const exists = state.messages.some((m) => String(m?._id) === String(msg._id));
        if (exists) return;
      } else {
        // fallback dedupe (optional)
        const exists = state.messages.some(
          (m) =>
            String(m?.senderId) === String(msg?.senderId) &&
            String(m?.receiverId) === String(msg?.receiverId) &&
            String(m?.message) === String(msg?.message) &&
            String(m?.createdAt) === String(msg?.createdAt)
        );
        if (exists) return;
      }

      state.messages.push(msg);
    },

    // ✅ increment unread badge
    incrementUnread: (state, action) => {
      const userId = action.payload;
      if (!userId) return;

      state.unreadCounts[userId] = (state.unreadCounts[userId] || 0) + 1;
    },

    // ✅ clear unread when chat opened
    clearUnread: (state, action) => {
      const userId = action.payload;
      if (!userId) return;

      state.unreadCounts[userId] = 0;
    },

    // ✅ mark active chat
    setActiveChatUserId: (state, action) => {
      state.activeChatUserId = action.payload || null;
    },
  },
});

export const {
  setOnlineUsers,
  setMessages,
  pushMessage,
  incrementUnread,
  clearUnread,
  setActiveChatUserId,
} = chatSlice.actions;

export default chatSlice.reducer;
