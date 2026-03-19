import api from "../lib/api";
export default {
  fetchTag: (uid) => api.get(`/nfc/${encodeURIComponent(uid)}`).then(r => r.data)
};
