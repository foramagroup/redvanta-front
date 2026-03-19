// frontend/tests/helpers/auth.js
import fetch from "node-fetch";

export async function loginAsAdmin(page) {
  const resp = await fetch("http://localhost:4000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "admin123" }),
  });

  const json = await resp.json();
  const token = json.token || json.accessToken;

  if (!token) throw new Error("No token from backend login");

  // set cookie in the browser context for domain localhost
  await page.context().addCookies([
    { name: "token", value: token, domain: "localhost", path: "/" },
  ]);
}
