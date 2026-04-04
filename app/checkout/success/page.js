"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PK
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK)
  : null;

export default function CheckoutSuccessPage() {
  const params = useSearchParams();
  const paymentIntentId = params.get("payment_intent");
  const clientSecret = params.get("payment_intent_client_secret");
  const manualStatus = params.get("status");
  const manualMessage = params.get("message");
  const orderNumber = params.get("order");
  const invoiceNumber = params.get("invoice");
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (manualStatus === "manual") {
      setStatus("manual");
      return;
    }

    if (!paymentIntentId || !clientSecret || !stripePromise) {
      setStatus("success");
      return;
    }

    stripePromise
      .then((stripe) => stripe?.retrievePaymentIntent(clientSecret))
      .then(({ paymentIntent }) => {
        setStatus(paymentIntent?.status === "succeeded" ? "success" : "failed");
      })
      .catch(() => {
        setStatus("success");
      });
  }, [clientSecret, manualStatus, paymentIntentId]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-dark px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Vérification du paiement...</p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-dark px-6">
        <div className="w-full max-w-md rounded-xl border border-border/50 bg-gradient-card p-8 text-center">
          <div className="mb-4 text-5xl text-destructive">×</div>
          <h1 className="font-display text-2xl font-bold">Paiement échoué</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Le paiement n&apos;a pas pu être confirmé. Tu peux relancer le checkout.
          </p>
          <Link
            href="/checkout"
            className="mt-6 inline-flex rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Revenir au checkout
          </Link>
        </div>
      </div>
    );
  }

  if (status === "manual") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-dark px-6">
        <div className="w-full max-w-md rounded-xl border border-border/50 bg-gradient-card p-8 text-center">
          <div className="mb-4 text-5xl text-green-400">✓</div>
          <h1 className="font-display text-2xl font-bold">Commande enregistree</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {manualMessage || "Votre commande a ete enregistree. Vous paierez sur place."}
          </p>
          {orderNumber && (
            <p className="mt-3 text-sm text-muted-foreground">
              Commande : <span className="font-medium text-foreground">{orderNumber}</span>
            </p>
          )}
          {invoiceNumber && (
            <p className="mt-1 text-sm text-muted-foreground">
              Facture : <span className="font-medium text-foreground">{invoiceNumber}</span>
            </p>
          )}
          <Link
            href="/"
            className="mt-6 inline-flex rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-dark px-6">
      <div className="w-full max-w-md rounded-xl border border-border/50 bg-gradient-card p-8 text-center">
        <div className="mb-4 text-5xl text-green-400">✓</div>
        <h1 className="font-display text-2xl font-bold">Paiement réussi</h1>
        <p className="mt-2 text-sm text-muted-foreground">Merci pour votre commande.</p>
        {/* <p className="mt-1 text-xs text-muted-foreground">
          Le backend finalise ensuite la commande via le webhook Stripe.
        </p> */}
        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
