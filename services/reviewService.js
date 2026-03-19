import api from "../lib/api";
export default {
  post: (payload) => api.post("/reviews", payload).then(r => r.data),
  listByLocation: (slug) => api.get(`/reviews?location=${encodeURIComponent(slug)}`).then(r => r.data)
};
