"use client";
import { useState } from "react";
import api from "../../../utils/api";
import { useRouter } from "next/navigation";

export default function AffiliateOnboard() {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState(null);
  const router = useRouter();

  const startOnboard = async () => {
    setLoading(true);
    try {
      const res = await api.post("/affiliate/connect/create", { country: "FR", type: "express" });
      // res.data.ok -> { accountId, url }
      if (res.data && res.data.url) {
        setUrl(res.data.url);
        // redirect user to stripe onboarding
        window.location.href = res.data.url;
      } else {
        alert("Impossible de démarrer l'onboarding");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur onboarding");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Onboarding Stripe (affilié)</h2>
      <p className="text-sm text-gray-600 mb-4">Connecte ton compte bancaire via Stripe pour recevoir des paiements.</p>
      <div className="flex gap-3">
        <button onClick={startOnboard} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>
          {loading ? "Création..." : "Démarrer l'onboarding Stripe"}
        </button>
        {url && <a target="_blank" rel="noreferrer" href={url} className="px-4 py-2 border rounded">Ouvrir onboarding</a>}
      </div>
    </div>
  );
}
