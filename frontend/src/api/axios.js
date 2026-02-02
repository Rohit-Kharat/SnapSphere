import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // must be set in Vercel
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // keep true ONLY if you use cookie auth
});
console.log("API BASE URL:", import.meta.env.VITE_API_URL);


export default api;
