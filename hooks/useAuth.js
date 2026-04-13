import api from "../utils/api";
import { useAuthStore } from "../store/authStore";

export default function useAuth() {
  const { user, token, login, logout } = useAuthStore();

  const signin = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    if (res.data.ok) login(res.data.token, res.data.user);
    return res.data;
  };

  return { user, token, signin, logout };
}
