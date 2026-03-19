// src/lib/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
 withCredentials: true,
  headers: { "Content-Type": "application/json" }
});;

// request interceptor to attach token if present
api.interceptors.request.use(config => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("krootal_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Auto logout on 401 ---
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
