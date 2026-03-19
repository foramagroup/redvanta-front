"use client";

import { useEffect, useState } from "react";
import api from "../../../lib/api";

export default function AffiliateClicks() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    api.get("/affiliate/clicks")
      .then((res) => setItems(res.data.items || []))
      .catch(() => setItems([]));
  }, []);

  if (items === null) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Clicks</h2>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>IP</th>
              <th>User agent</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>{new Date(c.createdAt).toLocaleString()}</td>
                <td>{c.ip}</td>
                <td>{c.userAgent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
