"use client";

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function MiniBar({ data }) {
  return (
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 4, 4]} />
          <XAxis dataKey="label" hide />
          <Tooltip />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
