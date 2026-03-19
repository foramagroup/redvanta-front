"use client";

import { useEffect, useState } from "react";
import UserEditModal from "./UserEditModal";
import api from "@/lib/api";

export default function UsersTable({ initialData = [], initialMeta = {} }) {
  // Normalisation initiale
  const normalizeArray = (input) => {
    if (Array.isArray(input)) return input;
    if (Array.isArray(input?.data)) return input.data;
    if (Array.isArray(input?.users)) return input.users;
    return [];
  };

  const normalizeMeta = (m) => ({
    page: m?.page || 1,
    pages: m?.pages || 1,
    limit: m?.limit || 20,
    total: m?.total || 0,
  });

  const [users, setUsers] = useState(normalizeArray(initialData));
  const [meta, setMeta] = useState(normalizeMeta(initialMeta));
  const [page, setPage] = useState(meta.page);
  const [limit] = useState(meta.limit);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [jump, setJump] = useState("");

  // Rechargement API
  const load = async (p = page, query = q) => {
    setLoading(true);

    try {
      const res = await api.get(
        `/dashboard/users?page=${p}&limit=${limit}&q=${encodeURIComponent(query)}`
      );

      const json = res;

      const list = normalizeArray(json.data || json.users);
      const metaOut = normalizeMeta(json.meta);

      setUsers(list);
      setMeta(metaOut);
      setPage(p);
    } catch (err) {
      console.error("Load users error", err);
      alert("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;

    try {
      await api.delete(`/dashboard/users/${id}`);
      load(1, q);
    } catch (err) {
      console.error("delete user", err);
      alert("Impossible de supprimer");
    }
  };

  const openEdit = (u) => setEditing(u);

  const closeEdit = () => {
    setEditing(null);
    load(page, q);
  };

  const handleJump = () => {
    const p = parseInt(jump, 10);
    if (!p || p < 1 || p > meta.pages)
      return alert("Numéro de page invalide");

    load(p, q);
  };

  return (
    <div>
      {/* === HEADER === */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={() => load(1, "")}
            className="px-3 py-2 rounded border mr-2"
          >
            Reload
          </button>

          {/* 🔍 Filtre côté client */}
          <input
            placeholder="Filtrer localement..."
            className="px-3 py-2 border rounded"
            onChange={(e) => {
              const val = e.target.value.toLowerCase();
              if (!val) {
                setUsers(normalizeArray(initialData));
                return;
              }
              setUsers(
                normalizeArray(initialData).filter(
                  (u) =>
                    (u.name || "").toLowerCase().includes(val) ||
                    (u.email || "").toLowerCase().includes(val)
                )
              );
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <div>
            Page {meta.page} / {meta.pages} — {meta.total} utilisateurs
          </div>

          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => load(Math.max(1, meta.page - 1), q)}
              disabled={meta.page <= 1}
              className="px-3 py-1 border rounded"
            >
              Prev
            </button>

            <button
              onClick={() => load(meta.page + 1, q)}
              disabled={meta.page >= meta.pages}
              className="px-3 py-1 border rounded"
            >
              Next
            </button>

            <input
              value={jump}
              onChange={(e) => setJump(e.target.value)}
              placeholder="Aller à"
              className="w-20 px-2 py-1 border rounded"
            />
            <button onClick={handleJump} className="px-3 py-1 border rounded">
              Go
            </button>
          </div>
        </div>
      </div>

      {/* === TABLE === */}
      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="text-left">
            <th className="p-3">Nom</th>
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-3">{u.name}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3">{u.role}</td>
              <td className="p-3">
                <button
                  className="mr-2 px-2 py-1 bg-yellow-200 rounded"
                  onClick={() => openEdit(u)}
                >
                  Edit
                </button>

                <button
                  className="px-2 py-1 bg-red-500 text-white rounded"
                  onClick={() => handleDelete(u.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {users.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                Aucun utilisateur
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* === FOOTER NAV === */}
      <div className="mt-4 flex items-center justify-between">
        <div></div>
        <div className="flex gap-2">
          <button
            onClick={() => load(1, q)}
            disabled={meta.page <= 1}
            className="px-3 py-1 border rounded"
          >
            First
          </button>

          <button
            onClick={() => load(meta.pages, q)}
            disabled={meta.page >= meta.pages}
            className="px-3 py-1 border rounded"
          >
            Last
          </button>
        </div>
      </div>

      {editing && <UserEditModal user={editing} onClose={closeEdit} />}
    </div>
  );
}
