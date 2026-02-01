import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => socket;

// derive backend origin from VITE_API_URL
const getSocketURL = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) return null;

  // remove /api/v1 → socket runs on backend root
  return apiUrl.replace("/api/v1", "");
};

export const connectSocket = (userId) => {
  if (!userId) return null;

  // already connected
  if (socket && socket.connected) return socket;

  const SOCKET_URL = getSocketURL();
  if (!SOCKET_URL) {
    console.error("Socket URL not found. Check VITE_API_URL");
    return null;
  }

  socket = io(SOCKET_URL, {
    query: { userId },
    withCredentials: true,
    transports: ["websocket", "polling"], // WS first, fallback allowed
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
