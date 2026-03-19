"use client";
import React from "react";

export default function FiltersPanel({ filters, setFilters }) {
  return (
    <div className="p-3 bg-white rounded shadow">
      <input
        placeholder="Search..."
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
        className="w-full mb-2 border p-2"
      />
      <div className="flex gap-2">
        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })} className="border p-2">
          <option value="">Toutes catégories</option>
          <option value="dance">Studio</option>
          <option value="football">Football</option>
          <option value="tennis">Tennis</option>
        </select>

        <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })} className="border p-2">
          <option value="createdAt">Créé</option>
          <option value="price">Prix</option>
          <option value="sales">Ventes</option>
        </select>

        <select value={filters.order} onChange={(e) => setFilters({ ...filters, order: e.target.value })} className="border p-2">
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>
    </div>
  );
}
