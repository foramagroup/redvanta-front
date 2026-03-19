import api from "../lib/api";
export default {
  list: () => api.get("/admin/payouts").then(r => r.data),
  create: (payload) => api.post("/admin/payouts/request", payload).then(r => r.data),
  pay: (id) => api.post(`/admin/payouts/${id}/pay`).then(r => r.data),
  approve: (id) => api.post(`/admin/payouts/${id}/approve`).then(r => r.data),
  decline: (id, reason) => api.post(`/admin/payouts/${id}/decline`, { reason }).then(r => r.data)
};
