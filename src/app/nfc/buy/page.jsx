"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";

export default function BuyTagPage() {
  const [priceId, setPriceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    api.get("/nfc/pay/prices").then(r => setPrices(r.data || [])).catch(()=>{});
  }, []);

  const buy = async (pid) => {
    setLoading(true);
    try {
      const res = await api.post("/nfc/pay/checkout", { priceId: pid });
      if (res.data.url) window.location.href = res.data.url;
    } catch (err) {
      console.error(err);
      alert("Erreur paiement");
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl">Acheter un tag NFC</h1>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {prices.map(p => (
          <div key={p.priceId} className="border p-4 rounded">
            <h3>{p.name}</h3>
            <p>{(p.unit_amount/100).toFixed(2)} {p.currency}</p>
            <button className="btn mt-2" onClick={()=>buy(p.priceId)} disabled={loading}>Acheter</button>
          </div>
        ))}
      </div>
    </div>
  );
}
