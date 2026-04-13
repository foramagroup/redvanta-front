"use client";
import { useEffect, useState } from "react";
import api from "../../../../utils/api";
import { useSearchParams } from "next/navigation";

export default function OnboardComplete({ params }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const affiliateId = searchParams.get("affiliateId"); // optional

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (affiliateId) {
          const res = await api.get(`/affiliate/connect/status/${affiliateId}`);
          setStatus(res.data.account);
        } else {
          setStatus({ message: "Aucun affiliateId fourni : vérifie dans ton compte." });
        }
      } catch (err) {
        console.error(err);
        setStatus({ error: err?.response?.data || String(err) });
      } finally { setLoading(false); }
    })();
  }, [affiliateId]);

  if (loading) return <div>Chargement statut...</div>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Onboarding terminé</h2>
      <pre className="bg-white p-4 rounded shadow">{JSON.stringify(status, null, 2)}</pre>
      <p className="mt-3 text-sm text-gray-600">Si payouts_enabled est true, ton compte est prêt à recevoir des transferts.</p>
    </div>
  );
}
