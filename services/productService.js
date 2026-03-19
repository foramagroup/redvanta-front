import api from "../lib/api";
export default {
  list: () => api.get("/products").then(r => r.data),
  getBySlug: (slug) => api.get(`/products/${slug}`).then(r => r.data)
};



