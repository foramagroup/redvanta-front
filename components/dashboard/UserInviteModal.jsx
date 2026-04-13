"use client";

import { useState } from "react";

export default function UserInviteModal({ onClose = () => {} }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");
  const [sending, setSending] = useState(false);

  const handleInvite = async () => {
    if (!email) return alert("Email requis");
    setSending(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/users/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, role }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Invite failed");
      alert("Invitation envoyée !");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Impossible d'envoyer l'invitation");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded w-[520px]">
        <h3 className="text-xl font-semibold mb-4">Inviter un utilisateur</h3>

        <label className="block mb-2">Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border px-2 py-1 mt-1" />
        </label>

        <label className="block mb-2">Nom (optionnel)
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border px-2 py-1 mt-1" />
        </label>

        <label className="block mb-4">Rôle
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border px-2 py-1 mt-1">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">Annuler</button>
          <button onClick={handleInvite} disabled={sending} className="px-4 py-2 bg-green-600 text-white rounded">{sending ? "Envoi..." : "Inviter"}</button>
        </div>
      </div>
    </div>
  );
}
