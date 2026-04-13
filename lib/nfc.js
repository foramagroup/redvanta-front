import api from "./api";

// NFC API helper
export const nfcApi = {
  async list(page = 1, limit = 20, q = "") {
    return api.get("/nfc", { page, limit, q });
  },

  async getOne(id) {
    return api.get(`/nfc/${id}`);
  },

  async exportCsv() {
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/nfc/export/csv`;
  },

  async getQr(id) {
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/nfc/${id}/qr`;
  },

  async generateBatch(count = 50, designId = null) {
    return api.post("/nfc/batch", { count, designId });
  },

  async generateZip(batchId) {
    return api.post(`/nfc/batch/${batchId}/zip`);
  },

  async getZip(batchId) {
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/nfc/batch/${batchId}/zip/download`;
  },

  async sendToWriter(uidList = []) {
    return api.post("/nfc-writer/webhook", { uids: uidList });
  },
};
