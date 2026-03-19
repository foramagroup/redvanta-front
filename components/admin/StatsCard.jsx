"use client";
import React, { useEffect, useState } from "react";

export default function StatsCard({ onRefresh }) {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    fetch("/api/products/stats").then(r=>r.json()).then(setStats);
  }, []);

  return (
    <div className="p-3 bg-white rounded shadow">
      <h3 className="font-semibold mb-2">Stats produits</h3>
      {stats ? (
        <div>
          <div>Total: <strong>{stats.total}</strong></div>
          <div>Prix moyen: <strong>{(stats.avgPrice?stats.avgPrice._avg.price:0).toFixed(2)} €</strong></div>
          <button className="mt-2 btn" onClick={onRefresh}>Refresh</button>
        </div>
      ) : <div>Loading...</div>}
    </div>
  );
}
