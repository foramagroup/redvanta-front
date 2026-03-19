"use client";

import { useState } from "react";
import api from "../utils/api";
import { loadStripe } from "@stripe/stripe-js";

export default function CheckoutForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      const res = await api.post("/api/payments/checkout", { items: [{ price: "price_xxx", quantity: 1 }], email });
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK);
      await stripe.redirectToCheckout({ sessionId: res.data.sessionId || res.data.session.id || res.data.session_id });
    } catch (err) {
      console.error(err);
      alert("Erreur paiement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <label className="block mb-2">Email</label>
      <input className="w-full p-2 border rounded mb-4" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={handle} disabled={loading}>Payer</button>
    </div>
  );
}
