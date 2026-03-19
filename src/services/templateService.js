import api from "@/lib/api";

export default {
  list: () => api.get("/customization/templates").then(r => r.data),
  upload: (file) => {
    const fd = new FormData();
    fd.append("image", file);
    return api.post("/customization/templates/upload", fd, { headers: { "Content-Type": "multipart/form-data" } }).then(r => r.data);
  },
  importLocal: (localPath, name) => api.post("/customization/templates/import-local", { path: localPath, name }).then(r => r.data)
};
