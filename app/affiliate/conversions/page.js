"use client";

import { useEffect, useState } from "react";
import api from "../../../lib/api";

export default function AffiliateConversions() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    api.get("/affiliate/conversions")
      .then((res) => setItems(res.data.items || []))
      .catch(() => setItems([]));
  }, []);

  if (items === null) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Conversions</h2>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Order</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>{new Date(c.createdAt).toLocaleString()}</td>
                <td>{c.orderId}</td>
                <td>{((c.amountCents || 0) / 100).toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
