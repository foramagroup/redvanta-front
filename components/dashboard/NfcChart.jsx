"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function NfcChart({ data = [] }) {
  // expect data = [{ date: '2025-11-20', count: 12 }, ...]
  const chartData = data.map(d => ({ date: d.date, count: d.count }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#16a34a" />
      </BarChart>
    </ResponsiveContainer>
  );
}
