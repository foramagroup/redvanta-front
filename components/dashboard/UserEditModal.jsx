"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function UserEditModal({ user, onClose = () => {} }) {
  const [form, setForm] = useState({ name: user.name, email: user.email, role: user.role });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/dashboard/users/${user.id}`, form);
      alert("Saved");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded w-[600px]">
        <h3 className="text-xl font-semibold mb-4">Editer utilisateur</h3>

        <label className="block mb-2">Nom
          <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full border px-2 py-1 mt-1" />
        </label>

        <label className="block mb-2">Email
          <input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full border px-2 py-1 mt-1" />
        </label>

        <label className="block mb-4">Role
          <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="w-full border px-2 py-1 mt-1">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">Annuler</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-sky-600 text-white rounded">{saving ? "Sauvegarde..." : "Sauvegarder"}</button>
        </div>
      </div>
    </div>
  );
}
