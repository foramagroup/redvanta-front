// frontend/components/client/ChartsWrapper.jsx
"use client";

import dynamic from "next/dynamic";
import React from "react";

const ResponsiveContainer = dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import("recharts").then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(m => m.Bar), { ssr: false });
const PieChart = dynamic(() => import("recharts").then(m => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then(m => m.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then(m => m.Cell), { ssr: false });

export function ClientBarChart({ data, dataKey="value", nameKey="name" }) {
  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <Bar dataKey={dataKey} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ClientPie({ data }) {
  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name">
            {data.map((entry, idx) => <Cell key={idx} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
