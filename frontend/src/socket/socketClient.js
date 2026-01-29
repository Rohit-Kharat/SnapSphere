import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => socket;

export const connectSocket = (userId) => {
  if (!userId) return null;

  // already connected
  if (socket && socket.connected) return socket;

  socket = io("http://localhost:8000", {
    query: { userId },
    withCredentials: true,
    transports: ["websocket", "polling"], // fallback if WS fails
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
