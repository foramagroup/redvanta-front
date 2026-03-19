export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  // Si l’API renvoie une page HTML → cela signifie une erreur serveur
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Erreur : la réponse n'est pas du JSON", text);
    throw new Error("Réponse invalide du serveur (HTML reçu au lieu de JSON)");
  }
}

export const dashboardApi = {
  // --- DASHBOARD ---
  getDashboard(uid) {
    return request(`/api/dashboard/${uid}`);
  },

  // --- USERS ---
  async getUsers() {
    return request(`/api/dashboard/users`);
  },

  async getUser(uid) {
    return request(`/api/dashboard/users/${uid}`);
  },

  // --- NFC ---
  getNfcTags(uid) {
    return request(`/api/dashboard/${uid}/nfc`);
  },

  getNfcTagDetail(uid, tagId) {
    return request(`/api/dashboard/${uid}/nfc/${tagId}`);
  },

  // --- HEATMAP ---
  getHeatmap(uid) {
    return request(`/api/dashboard/${uid}/heatmap`);
  },

  // --- NFC Stats (dashboard/nfc) ---
  getNfcStats() {
    return request(`/api/dashboard/nfc/stats`);
  }
};
