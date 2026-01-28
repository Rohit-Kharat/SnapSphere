import api from "./axios";

export const getMe = () => api.get("/user/me");
export const getProfile = (id) => api.get(`/user/${id}/profile`);
export const followOrUnfollow = (id) => api.post(`/user/followorunfollow/${id}`);
