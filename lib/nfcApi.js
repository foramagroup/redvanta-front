// frontend/lib/nfcApi.js
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...opts
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API error ${res.status}`);
  }
  return res.json();
}

export default {
  list: (page=1, limit=20, q="") => req(`/nfc?page=${page}&limit=${limit}&q=${encodeURIComponent(q)}`),
  get: (id) => req(`/nfc/${id}`),
  create: (payload) => req(`/nfc`, { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) => req(`/nfc/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  delete: (id) => req(`/nfc/${id}`, { method: "DELETE" }),
  logScan: (uid) => req(`/nfc/r?uid=${encodeURIComponent(uid)}`),
  getQr: (id) => `${BASE}/nfc/${id}/qrcode`,
  exportCsv: () => `${BASE}/nfc/export`
};
