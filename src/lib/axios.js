import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000",
  withCredentials: true, // important for cookies
});

// LOGIN
export async function login(email, password) {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
}

// REGISTER
export async function register(email, password, name) {
  const res = await api.post("/auth/register", { email, password, name });
  return res.data;
}

// GET CURRENT USER
export async function getMe() {
  const res = await api.get("/auth/me");
  return res.data;
}

// LOGOUT
export async function logout() {
  const res = await api.post("/auth/logout");
  return res.data;
}
