"use client";

/**
 * app/nfc/page.js
 * Page utile pour tester/consulter une puce NFC via UID ou saisir manuellement
 * Le backend doit exposer GET /api/nfc/:uid
 */

import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function NfcPage() {
  const [uid, setUid] = useState("");
  const [tag, setTag] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchTag(u) {
    if (!u) return;
    setLoading(true);
    try {
      const res = await api.get(`/nfc/${encodeURIComponent(u)}`);
      setTag(res.data || null);
    } catch (err) {
      console.error(err);
      setTag(null);
      alert(err.response?.data?.message || "Tag non trouvé");
    } finally {
      setLoading(false);
    }
  }

  // Option: récupérer uid depuis l'URL query ?uid=...
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("uid");
      if (q) {
        setUid(q);
        fetchTag(q);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1 className="text-2xl font-bold mb-4">NFC / Tag</h1>

      <div className="card mb-4">
        <label className="block mb-2">
          <div className="text-sm">UID de la puce</div>
          <input
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="ex: 04A224B3C41280"
          />
        </label>

        <div className="flex gap-2">
          <button className="btn" onClick={() => fetchTag(uid)} disabled={loading}>
            {loading ? "Recherche..." : "Rechercher la puce"}
          </button>

          <button
            className="btn"
            onClick={() => {
              if (tag?.payload?.url) window.open(tag.payload.url, "_blank");
              else alert("Pas d'URL dans le payload.");
            }}
            disabled={!tag}
          >
            Ouvrir l'URL (si présente)
          </button>
        </div>
      </div>

      {tag ? (
        <div className="card">
          <h3 className="font-semibold">Détails du tag</h3>
          <p><strong>UID:</strong> {tag.uid}</p>
          <p><strong>Used:</strong> {tag.used ? "oui" : "non"}</p>
          <p><strong>Payload brut:</strong></p>
          <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(tag.payload, null, 2)}</pre>
        </div>
      ) : (
        <div className="text-muted">Aucun tag chargé.</div>
      )}
    </div>
  );
}
