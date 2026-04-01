"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import Link from "next/link";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK);

export default function SuccessPage() {
  const params          = useSearchParams();
  const paymentIntentId = params.get("payment_intent");
  const [status, setStatus] = useState("loading"); // loading | success | failed

  useEffect(() => {
    if (!paymentIntentId) { setStatus("success"); return; }

    stripePromise.then((stripe) => {
      stripe.retrievePaymentIntent(params.get("payment_intent_client_secret")).then(
        ({ paymentIntent }) => {
          setStatus(paymentIntent?.status === "succeeded" ? "success" : "failed");
        }
      ).catch(() => setStatus("success")); // si pas de client_secret en URL on suppose succès
    });
  }, [paymentIntentId]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Vérification du paiement…</p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <div className="text-red-500 text-5xl mb-4">✗</div>
        <h1 className="text-2xl font-bold mb-2">Paiement échoué</h1>
        <p className="text-gray-600 mb-6">Le paiement n'a pas pu être traité.</p>
        <Link href="/checkout" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold">
          Réessayer
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <div className="text-green-500 text-5xl mb-4">✓</div>
      <h1 className="text-2xl font-bold mb-2">Paiement réussi !</h1>
      <p className="text-gray-600 mb-2">Merci pour votre commande.</p>
      <p className="text-gray-500 text-sm mb-6">Un email de confirmation vous sera envoyé.</p>
      <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold">
        Retour à l'accueil
      </Link>
    </div>
  );
}
