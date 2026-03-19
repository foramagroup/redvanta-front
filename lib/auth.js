export function saveToken(token) {
  if (typeof window === "undefined") return;
  localStorage.setItem("krootal_token", token);
}
export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("krootal_token");
}
