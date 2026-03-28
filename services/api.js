import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true
});

// attach token if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem("krootal_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

export async function fetchBusiness(slug) {
  const { data } = await api.get(`/review/${slug}`);
  return data?.data || data;
}

export async function submitFeedback(payload) {
  const { data } = await api.post("/review/feedback", payload);
  return data?.data || data;
}

export async function trackEvent(payload) {
  const { data } = await api.post("/review/track", payload);
  return data?.data || data;
}
