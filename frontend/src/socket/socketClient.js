import { io } from "socket.io-client";

let socket = null;
let currentUserId = null;

export const getSocket = () => socket;

export const connectSocket = (userId) => {
  if (!userId) return null;

  // if same user already connected, reuse
  if (socket && socket.connected && currentUserId === userId) {
    return socket;
  }

  // different user or stale socket -> disconnect first
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  currentUserId = userId;

  socket = io("https://snapsphere-jwj8.onrender.com", {
    query: { userId },
    withCredentials: true,
    transports: ["websocket", "polling"],
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentUserId = null;
  }
};
