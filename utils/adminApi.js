// frontend/utils/adminApi.js
import axios from "axios";

const adminApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/admin",
  headers: { "Content-Type": "application/json" }
});

// attach token (if any) from localStorage
adminApi.interceptors.request.use(config => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("krootal_token") : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {}
  return config;
});

export default adminApi;
