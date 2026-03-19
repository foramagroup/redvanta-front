"use client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function SuccessPage() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  useEffect(() => {
    if (sessionId) {
      // optional: call backend to fetch order by session and show summary
      // fetch(`/api/orders/by-session/${sessionId}`)
    }
  }, [sessionId]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Paiement réussi</h1>
      <p>Merci pour votre achat — votre commande est en cours de traitement.</p>
    </div>
  );
}
