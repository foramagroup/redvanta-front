"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import dynamic from "next/dynamic";
import { Line } from "react-chartjs-2";
import 'chart.js/auto';

// Leaflet heat dynamic import (no SSR)
const MapWithHeat = dynamic(() => import('@/components/MapWithHeat'), { ssr: false });

export default function TagStats({ params }) {
  const tagId = params.tagId;
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/stats/tag/${tagId}`).then(r => setData(r.data)).catch(err => console.error(err));
  }, [tagId]);

  if (!data) return <div className="p-6">Chargement…</div>;

  const labels = Object.keys(data.perDay).sort();
  const counts = labels.map(d => data.perDay[d]);

  const chartData = {
    labels,
    datasets: [
      { label: "Scans / jour", data: counts, fill: false, borderColor: "#0b74da", tension: 0.2 }
    ]
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Statistiques du tag {tagId.slice(0,8)}</h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="font-semibold mb-2">Scans par jour</h3>
          <Line data={chartData} />
        </div>

        <div className="card p-4">
          <h3 className="font-semibold mb-2">Répartition par pays</h3>
          <ul>
            {Object.entries(data.byCountry).map(([c,v]) => <li key={c}>{c} — {v}</li>)}
          </ul>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-semibold mb-2">Heatmap</h3>
        <div style={{ height: 420 }}>
          <MapWithHeat points={data.heat} />
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-semibold mb-2">Derniers scans</h3>
        <div className="overflow-auto max-h-64">
          <table className="w-full">
            <thead><tr><th>Date</th><th>IP</th><th>Pays</th><th>Agent</th></tr></thead>
            <tbody>
              {data.recent.map(r => (
                <tr key={r.id}>
                  <td>{new Date(r.at).toLocaleString()}</td>
                  <td>{r.ip}</td>
                  <td>{r.country || '-'}</td>
                  <td title={r.agent}>{r.agent ? r.agent.slice(0,60) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3">
          <a className="btn" href={`${process.env.NEXT_PUBLIC_API_URL}/stats/export/${tagId}.csv`}>Exporter CSV</a>
        </div>
      </div>
    </div>
  );
}
