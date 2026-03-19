"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function NfcChart({ data }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md h-80">
      <h2 className="text-xl font-semibold mb-4">NFC Scans / Month</h2>

      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#22c55e" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
