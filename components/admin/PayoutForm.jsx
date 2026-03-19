"use client";
import { useState } from "react";
import adminApi from "../../../utils/adminApi";

export default function PayoutForm({ initial = null, onCreated = () => {} }) {
  const [affiliateId, setAffiliateId] = useState(initial?.affiliateId || "");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const amountCents = Math.round(Number(amount) * 100);
      await adminApi.post("/payouts/request", { affiliateId, amountCents, currency, note });
      setAffiliateId(""); setAmount(""); setNote("");
      onCreated();
    } catch (err) { console.error(err); alert("Erreur"); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-4 gap-3">
      <input value={affiliateId} onChange={e=>setAffiliateId(e.target.value)} placeholder="affiliateId" className="p-2 border rounded" required />
      <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Montant (ex: 12.50)" className="p-2 border rounded" required />
      <select value={currency} onChange={e=>setCurrency(e.target.value)} className="p-2 border rounded">
        <option>EUR</option>
        <option>USD</option>
      </select>
      <div className="flex gap-2">
        <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Note (optionnel)" className="p-2 border rounded flex-1" />
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? "..." : "Créer demande"}</button>
      </div>
    </form>
  );
}
