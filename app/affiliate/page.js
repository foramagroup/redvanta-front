"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function AffiliateMain() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/affiliate/stats")
      .then((res) => setStats(res.data))
      .catch(() =>
        setStats({ clicks: 0, conversions: 0, earnings: 0, referralLink: "" })
      );
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Affiliate Dashboard</h2>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card">
          <h4>Clicks</h4>
          <div className="text-2xl mt-2">{stats.clicks}</div>
        </div>

        <div className="card">
          <h4>Conversions</h4>
          <div className="text-2xl mt-2">{stats.conversions}</div>
        </div>

        <div className="card">
          <h4>Earnings</h4>
          <div className="text-2xl mt-2">
            {((stats.earnings || 0) / 100).toFixed(2)} €
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <h4>Referral link</h4>
        <code className="block mt-2">
          {stats.referralLink ||
            `${typeof window !== "undefined"
              ? window.location.origin
              : ""
            }/?ref=YOURCODE`}
        </code>
      </div>
    </div>
  );
}
