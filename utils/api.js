import axios from "axios";

const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: base,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
  timeout: 15000
});

// Request interceptor: add token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("krootal_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("krootal_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
