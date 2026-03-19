"use client";
import React, { useEffect, useState } from "react";
import paymentService from "@/services/paymentService";

export default function CheckoutPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]); // { productId, qty }

  useEffect(() => {
    // TODO: fetch products from API /api/products (example)
    fetch("/api/products-list.json").then(r => r.json()).then(setProducts).catch(()=>{});
  }, []);

  const addToCart = (p) => {
    setCart(prev => {
      const exists = prev.find(i => i.productId === p.id);
      if (exists) return prev.map(i => i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId: p.id, quantity: 1 }];
    });
  };

  const checkout = async () => {
    try {
      const metadata = { customerEmail: "test@example.com" }; // adapt
      const { url } = await paymentService.createSession(cart, metadata);
      // redirect to Stripe Checkout
      if (url) window.location.href = url;
    } catch (err) {
      console.error("create session error", err);
      alert("Erreur création session de paiement");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Checkout</h1>

      <div className="grid grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} className="border p-4">
            <h3 className="font-semibold">{p.title}</h3>
            <div>{p.priceCents/100} {p.currency}</div>
            <button onClick={() => addToCart(p)} className="mt-2 btn">Ajouter</button>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h2 className="font-bold">Panier</h2>
        <ul>
          {cart.map(i => <li key={i.productId}>{i.productId} x {i.quantity}</li>)}
        </ul>
        <button onClick={checkout} className="mt-3 btn bg-blue-600 text-white px-4 py-2 rounded">Payer</button>
      </div>
    </div>
  );
}
