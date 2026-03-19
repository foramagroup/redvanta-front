import api from "../lib/api";

export default {
  register: (payload) => api.post("/affiliate/register", payload).then(r => r.data),
  getStats: () => api.get("/affiliate/stats").then(r => r.data),
  getClicks: () => api.get("/affiliate/clicks").then(r => r.data),
  getConversions: () => api.get("/affiliate/conversions").then(r => r.data),
  trackRef: (code, redirect) => api.get(`/affiliate/track?code=${encodeURIComponent(code)}&redirect=${encodeURIComponent(redirect || "/")}`).then(r => r.data)
};
