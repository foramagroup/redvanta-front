import api from "../lib/api";
import { saveToken, clearToken } from "../lib/auth";

export default {
  login: (email, pass) => api.post("/auth/login", { email, password: pass }).then(r => {
    const token = r.data?.token || r.data?.accessToken;
    if (token) saveToken(token);
    return r.data;
  }),
  logout: () => { clearToken(); return Promise.resolve(); }
};
