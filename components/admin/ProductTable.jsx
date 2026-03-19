"use client";
import React from "react";
import Link from "next/link";

export default function ProductTable({ items, loading, selected, setSelected, onRefresh }) {
  function toggle(id) {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  }

  return (
    <div className="bg-white rounded shadow p-3">
      <table className="w-full">
        <thead>
          <tr>
            <th className="p-2"><input type="checkbox" onChange={(e)=>{ if(e.target.checked){ items.forEach(i=>setSelected(s=>new Set([...s, i.id])))} else setSelected(new Set())}} /></th>
            <th className="p-2">Titre</th>
            <th className="p-2">Catégorie</th>
            <th className="p-2">Prix</th>
            <th className="p-2">Ventes</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(p => (
            <tr key={p.id} className="border-t">
              <td className="p-2"><input type="checkbox" checked={selected.has(p.id)} onChange={()=>toggle(p.id)} /></td>
              <td className="p-2">
                <div className="font-medium">{p.title}</div>
                <div className="text-xs text-gray-500">{p.slug}</div>
              </td>
              <td className="p-2">{p.category || "-"}</td>
              <td className="p-2">{(p.price || p.priceCents/100).toFixed(2)} €</td>
              <td className="p-2">{p.sales || 0}</td>
              <td className="p-2 flex gap-2">
                <Link href={`/dashboard/products/edit/${p.id}`} className="px-2 py-1 bg-blue-600 text-white rounded">Éditer</Link>
                <Link href={`/product/${p.slug}`} className="px-2 py-1 border rounded">Voir</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
