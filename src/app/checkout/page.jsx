"use client";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import api from "@/lib/api";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK);

// ─── Étape 2 : Formulaire de paiement Stripe ────────────────────────────────
function PaymentForm({ amounts }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    // Stripe redirige automatiquement si succès
    if (stripeError) {
      setError(stripeError.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Récapitulatif des montants */}
      <div className="border rounded-lg p-4 bg-gray-50 space-y-1 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Sous-total</span>
          <span>{amounts.subtotalEUR.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Livraison</span>
          <span>{amounts.shippingCostEUR.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
          <span>Total</span>
          <span>{amounts.totalEUR.toFixed(2)} €</span>
        </div>
      </div>

      {/* Widget Stripe */}
      <PaymentElement />

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 transition-colors"
      >
        {loading ? "Paiement en cours…" : `Payer ${amounts.totalEUR.toFixed(2)} €`}
      </button>
    </form>
  );
}

// ─── Étape 1 : Formulaire de livraison ──────────────────────────────────────
const INITIAL_SHIPPING = {
  shippingFullName: "",
  shippingAddress:  "",
  shippingCity:     "",
  shippingState:    "",
  shippingZip:      "",
  shippingCountry:  "France",
  shippingMethod:   "standard",
};

const FIELDS = [
  { name: "shippingFullName", label: "Nom complet",    required: true },
  { name: "shippingAddress",  label: "Adresse",         required: true },
  { name: "shippingCity",     label: "Ville",           required: true },
  { name: "shippingState",    label: "État / Région",   required: false },
  { name: "shippingZip",      label: "Code postal",     required: true },
  { name: "shippingCountry",  label: "Pays",            required: true },
];

export default function CheckoutPage() {
  const [shipping,      setShipping]      = useState(INITIAL_SHIPPING);
  const [clientSecret,  setClientSecret]  = useState(null);
  const [amounts,       setAmounts]       = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);

  const handleChange = (e) =>
    setShipping((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post("/orders", shipping);
      setClientSecret(data.stripeClientSecret);
      setAmounts(data.amounts);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la création de la commande");
    } finally {
      setLoading(false);
    }
  };

  // ── Étape 2 : afficher le widget Stripe ──
  if (clientSecret) {
    return (
      <div className="max-w-md mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Paiement</h1>
        <Elements
          stripe={stripePromise}
          options={{ clientSecret, locale: "fr" }}
        >
          <PaymentForm amounts={amounts} />
        </Elements>
      </div>
    );
  }

  // ── Étape 1 : formulaire de livraison ──
  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Livraison</h1>

      <form onSubmit={handleCreateOrder} className="space-y-4">
        {FIELDS.map(({ name, label, required }) => (
          <div key={name}>
            <label className="block text-sm font-medium mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
              name={name}
              value={shipping[name]}
              onChange={handleChange}
              required={required}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium mb-1">Mode de livraison</label>
          <select
            name="shippingMethod"
            value={shipping.shippingMethod}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="standard">Standard</option>
            <option value="express">Express</option>
          </select>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 transition-colors"
        >
          {loading ? "Chargement…" : "Continuer vers le paiement →"}
        </button>
      </form>
    </div>
  );
}
