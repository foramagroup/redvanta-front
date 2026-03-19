// frontend/components/CheckoutElements.jsx
"use client";
import { useState } from "react";
import { CardElement, Elements, useStripe, useElements } from "@stripe/react-stripe-js";
import { stripePromise } from "../utils/stripe";
import api from "../utils/api";

function CheckoutInner({ amountCents }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!elements || !stripe) return alert("Stripe not ready");
    setLoading(true);
    try {
      const res = await api.post("/api/payments/create-payment-intent", { amountCents });
      const clientSecret = res.data.clientSecret;
      const card = elements.getElement(CardElement);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card }
      });
      if (result.error) {
        alert(result.error.message);
      } else if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
        alert("Paiement réussi !");
        // optionnel : enregistrer order / rediriger
      }
    } catch (err) {
      console.error(err);
      alert("Erreur paiement");
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="mb-3">
        <CardElement options={{ style: { base: { fontSize: "16px" } } }} />
      </div>
      <button onClick={handlePay} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">{loading ? "Paiement..." : "Payer"}</button>
    </div>
  );
}

export default function CheckoutElements({ amountCents = 100 }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutInner amountCents={amountCents} />
    </Elements>
  );
}
