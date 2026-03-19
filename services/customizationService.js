import api from "../lib/api";

export default {
  get: (orderId) => api.get(`/customization/${orderId}`).then(r => r.data),
  save: (orderId, payload) => api.post(`/customization/${orderId}`, payload).then(r => r.data),
  uploadImage: (orderId, side, file) => {
    const fd = new FormData();
    fd.append("image", file);
    fd.append("side", side);
    return api.post(`/customization/${orderId}/upload-image`, fd, { headers: { "Content-Type": "multipart/form-data" } }).then(r => r.data);
  },
  exportPdf: (orderId, payload) => api.post(`/customization/${orderId}/export-pdf`, payload).then(r => r.data),
  templatesList: () => api.get(`/customization/templates`).then(r => r.data),
  templateUpload: (file) => {
    const fd = new FormData();
    fd.append("image", file);
    return api.post("/customization/templates/upload", fd, { headers: { "Content-Type": "multipart/form-data" } }).then(r => r.data);
  }
};
