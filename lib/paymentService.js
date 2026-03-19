import api from "./api";

export default {
  createSession: (items, metadata = {}) => api.post("/payments/create-session", { items, metadata }).then(r => r.data)
}
