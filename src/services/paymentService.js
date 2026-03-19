// frontend/src/services/paymentService.js
import api from "../lib/api";

export default {
  createSession: (items, metadata = {}, success_url = null, cancel_url = null) =>
    api.post("/payments/create-session", { items, metadata, success_url, cancel_url }).then(r => r.data)
};
