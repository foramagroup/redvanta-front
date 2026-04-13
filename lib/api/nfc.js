// lib/nfc.js

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// helper GET
async function get(path) {
  const r = await fetch(API + path, { credentials: "include" });
  if (!r.ok) throw new Error("API error GET " + path);
  return r.json();
}

// helper POST
async function post(path, body = {}) {
  const r = await fetch(API + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("API error POST " + path);
  return r.json();
}

export const nfcApi = {
  /** list NFC tags (with pagination + search) */
  async list(page = 1, limit = 20, q = "") {
    return get(`/nfc?page=${page}&limit=${limit}&q=${encodeURIComponent(q)}`);
  },

  /** get one NFC tag */
  async getOne(id) {
    return get(`/nfc/${id}`);
  },

  /** export CSV */
  exportCsv() {
    return `${API}/nfc/export/csv`;
  },

  /** Get QR PNG for download */
  getQr(id) {
    return `${API}/nfc/${id}/qr`;
  },

  /** Mass-generate NFC tags */
  async generateBatch(count = 50, designId = null) {
    return post(`/nfc/batch`, { count, designId });
  },

  /** Trigger ZIP generation for all QR */
  async generateZip(batchId) {
    return post(`/nfc/batch/${batchId}/zip`);
  },

  /** download ZIP */
  getZip(batchId) {
    return `${API}/nfc/batch/${batchId}/zip/download`;
  },

  /** webhook to NFC writer device */
  async sendToWriter(uidList = []) {
    return post(`/nfc-writer/webhook`, { uids: uidList });
  }
};
