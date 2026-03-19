"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

export default function AdminDesignsPage() {
  const [designs, setDesigns] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetchList();
  }, []);

  async function fetchList() {
    const res = await api.get("/admin/designs");
    setDesigns(res.data.items || []);
  }

  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce design ?")) return;
    await api.delete(`/admin/designs/${id}`);
    fetchList();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin — Designs</h1>

      <div className="mb-4 flex gap-2">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Recherche..." className="border p-2 rounded" />
        <button className="btn" onClick={() => api.get(`/admin/designs?search=${encodeURIComponent(q)}`).then(r=>setDesigns(r.data.items))}>Rechercher</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {designs.map(d => (
          <div key={d.id} className="border p-3 rounded shadow-sm">
            <img src={`${process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/,'')}/uploads/customizations/${d.thumbnail || d.frontFile || ""}`} alt={d.title} className="w-full h-40 object-cover mb-2" />
            <h3 className="font-semibold">{d.title || d.id}</h3>
            <div className="mt-2 flex gap-2">
              <Link href={`/admin/designs/${d.id}`} className="btn">Éditer</Link>
              <button className="btn bg-red-600 text-white" onClick={() => handleDelete(d.id)}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
