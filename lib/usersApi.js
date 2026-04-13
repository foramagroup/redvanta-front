export const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function getUsers(page = 1, limit = 20) {
  const res = await fetch(`${API_BASE}/users?page=${page}&limit=${limit}`);
  return res.json();
}

export async function inviteUser(email) {
  const res = await fetch(`${API_BASE}/users/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  return res.json();
}

export function exportUsersCsv() {
  window.location.href = `${API_BASE}/users/export`;
}
