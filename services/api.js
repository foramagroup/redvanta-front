// src/services/api.js
export default {
  getProducts: async () => {
    const response = await fetch("/products");
    return response.json();
  },
};