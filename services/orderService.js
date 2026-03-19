import api from "../lib/api";
export default {
  createCheckoutSession: (items, email, affiliateCode) => api.post("/orders/create-checkout-session", { items, email, affiliateCode }).then(r => r.data),
  myOrders: () => api.get("/orders").then(r => r.data)
};
