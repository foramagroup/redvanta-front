"use client";

import { useEffect, useState } from "react";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function SuperadminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${apiBase}/api/superadmin/dashboard/overview`, {
          credentials: "include",
        });
        const json = await res.json();

        if (!res.ok) {
          setError(json?.error || "Failed to load dashboard.");
          setLoading(false);
          return;
        }

        setData(json);
      } catch {
        setError("Backend unavailable.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-400">{error}</div>;
  }

  const cards = [
    { label: "Users", value: data?.metrics?.users ?? 0 },
    { label: "Orders", value: data?.metrics?.orders ?? 0 },
    { label: "Reviews", value: data?.metrics?.reviews ?? 0 },
    { label: "Locations", value: data?.metrics?.locations ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Superadmin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Global platform overview.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border/50 bg-gradient-card p-5">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="mt-2 font-display text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
