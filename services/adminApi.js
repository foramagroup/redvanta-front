import api from "./api";

const adminApi = {
  get: (path, opts) => api.get(`/admin${path}`.replace("//", "/"), opts),
  post: (path, payload, opts) => api.post(`/admin${path}`.replace("//", "/"), payload, opts),
  put: (path, payload, opts) => api.put(`/admin${path}`.replace("//", "/"), payload, opts),
  del: (path, opts) => api.delete(`/admin${path}`.replace("//", "/"), opts)
};

export default adminApi;
