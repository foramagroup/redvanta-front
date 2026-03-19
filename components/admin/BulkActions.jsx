"use client";
import React, { useState } from "react";

export default function BulkActions({ selected, onAction }) {
  const [loading, setLoading] = useState(false);

  async function deleteSelected() {
    if (!confirm("Supprimer les éléments sélectionnés ?")) return;
    setLoading(true);
    const ids = Array.from(selected);
    await fetch("/api/products/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids })
    });
    setLoading(false);
    onAction();
  }

  return (
    <div className="mb-3 flex items-center gap-3">
      <div>{selected.size} selected</div>
      <button className="btn-red" onClick={deleteSelected} disabled={loading || selected.size===0}>Supprimer</button>
      <a href="/api/products/export/csv" className="btn">Export CSV</a>
    </div>
  );
}
