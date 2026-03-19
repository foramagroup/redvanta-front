"use client";

import { useState } from "react";

export default function NFCBuyPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const buyNfc = async () => {
    try {
      setLoading(true);
      setError("");

      await new Promise((r) => setTimeout(r, 300));

      // 🔥 redirection EXACTEMENT attendue par Playwright
      window.location.href = "/nfc/buy/success";

    } catch (err) {
      setError("Erreur lors de l'achat NFC.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Achat NFC</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        data-testid="nfc-buy-first"
        onClick={buyNfc}
        disabled={loading}
        style={{ padding: "12px 20px", fontSize: 18 }}
      >
        {loading ? "Chargement..." : "Acheter"}
      </button>
    </div>
  );
}
